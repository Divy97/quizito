import { ChatAnthropic } from '@langchain/anthropic';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { quizSchema } from '../../shared/types/quizSchemas.js';
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { filterSemanticallyUnique, Question } from '../../shared/utils/similarity.js';
import { QuizRefinementService } from './quizRefinementService.js';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { cleanJson } from '../../shared/utils/jsonUtils.js';

const embeddingModel = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY!,
  model: "text-embedding-004", 
});


const parser = StructuredOutputParser.fromZodSchema(quizSchema as any);

const taxonomyInstructionsMap: Record<string, string> = {
  remembering: `Generate questions that test the ability to recall facts, basic concepts, and answers. The questions should ask for definitions, lists, or simple identification of information directly present in the source text. Focus on who, what, where, when, and how.`,
  understanding: `Generate questions that test the ability to explain ideas or concepts. **Crucially, the question should NOT be answerable by simply stating a definition.** It should require explaining a relationship, a process, or a consequence. For example, instead of 'What is X?', ask 'How does X enable Y?' or 'What is the key difference between X and Y?'`,
  applying: `Generate questions that test the ability to use information in new situations. The questions should present a hypothetical scenario or problem where the user must apply a rule, concept, or theory from the source text to find a solution. Focus on questions that ask the user to "solve," "use," or "demonstrate."`,
  analyzing: `Generate questions that test the ability to draw connections and analyze components. The questions should require the user to differentiate, organize, or compare/contrast elements from the source text. Focus on identifying patterns, motives, or underlying assumptions.`,
};

const getPromptTemplate = (taxonomyLevel: string): ChatPromptTemplate => {
  const taxonomyInstructions =
    taxonomyInstructionsMap[taxonomyLevel] || taxonomyInstructionsMap['remembering'];

  const systemPrompt = `
<Persona>
You are a world-class expert in pedagogy and quiz design, specializing in creating educational content based on Bloom's Taxonomy.
</Persona>

<Task>
Your task is to generate a complete quiz based on the user's provided <SourceText>.
The quiz must contain exactly {question_count} multiple-choice questions.

**CRITICAL INSTRUCTIONS:**
1.  For each question, you MUST provide a single array of exactly four \`options\`.
2.  One of these options must be the correct answer, and it should have its \`is_correct\` flag set to \`true\`. The other three options must be plausible distractors with their \`is_correct\` flag set to \`false\`.
3.  **The position of the correct answer in the \`options\` array MUST be randomized.** Do not always place it first or last.
4.  For each question, you MUST provide a "source_quote" field containing the exact sentence or phrase from the <SourceText> that justifies the correct answer. This is non-negotiable.
5.  Distractors must be challenging and well-thought-out. Good distractors often include:
    - Common misconceptions related to the topic.
    - Concepts that are closely related but not the correct answer.
    - Options that are factually correct but do not correctly answer the question posed.
    - Subtly incorrect numerical values or terminology.
    - Logical fallacies or subtly incorrect statements.
6.  You must also provide a brief "explanation" for why the correct answer is correct, which can elaborate on the source_quote.

**Taxonomy-Specific Instructions:**
${taxonomyInstructions}
</Task>

<OutputInstructions>
The entire output must be in the JSON format specified below. Do not include any other text, markdown, or commentary outside of the JSON structure.
{format_instructions}
</OutputInstructions>
`;

  return ChatPromptTemplate.fromMessages([
    ['system', systemPrompt],
    ['human', '<SourceText>\n{source_data}\n</SourceText>'],
  ]);
};

const difficultyTaxonomyMap = {
  easy: { remembering: 1.0 },
  medium: { understanding: 0.5, remembering: 0.3, applying: 0.2 },
  hard: { analyzing: 0.6, applying: 0.4 },
};

const generateQuestionsForTaxonomy = async (
  taxonomyLevel: string,
  questionCount: number,
  sourceData: string
) => {
  if (questionCount <= 0) {
    return { questions: [] };
  }
  
  const temperature =
    taxonomyLevel === 'applying' || taxonomyLevel === 'analyzing' ? 0.7 : 0.3;
  
  const model = new ChatAnthropic({
    model: 'claude-3-5-sonnet-20240620',
    temperature,
  });
  
  const prompt = getPromptTemplate(taxonomyLevel);

  // chain that just gets the raw string output
  const stringParser = new StringOutputParser();
  const chain = prompt.pipe(model).pipe(stringParser);
  
  // Invoke the chain to get the raw string
  const rawOutput = await chain.invoke({
    question_count: questionCount,
    source_data: sourceData,
    format_instructions: parser.getFormatInstructions(),
  });

  try {
    // Clean the raw string using the utility function
    const cleanedOutput = cleanJson(rawOutput);

    // Manually parse the cleaned string
    const parsedJson = await parser.parse(cleanedOutput);
    return parsedJson;

  } catch (e) {
    console.error("Failed to parse cleaned JSON:", e);
    console.error("Raw LLM Output that failed parsing:", rawOutput);
    return { questions: [] }; 
  }
};


export const generateQuizFromSource = async (
  difficulty: 'easy' | 'medium' | 'hard',
  totalQuestionCount: number,
  sourceData: string,
  taxonomyLevelOverride?: string
) => {
    // Oversample and Generate
    const blend = difficultyTaxonomyMap[difficulty];
    const generationPromises = [];
    const neededCounts: Record<string, number> = {};
    const OVERSAMPLING_FACTOR = 1.5;
    const OVERSAMPLING_MIN_ADD = 2;

    const taxonomyLevels = taxonomyLevelOverride ? [taxonomyLevelOverride] : Object.keys(blend);

    for (const level of taxonomyLevels) {
        const percentage = taxonomyLevelOverride ? 1.0 : (blend as any)[level];
        const needed = Math.round(totalQuestionCount * percentage);
        neededCounts[level] = needed;

        if (needed > 0) {
            const requested = Math.ceil(needed * OVERSAMPLING_FACTOR) + OVERSAMPLING_MIN_ADD;
            generationPromises.push(
                generateQuestionsForTaxonomy(level, requested, sourceData)
            );
        }
    }

    const results = await Promise.all(generationPromises);

    // Filter for Uniqueness and Select
    let finalQuestions: Question[] = [];

    for (let i = 0; i < results.length; i++) {
        const result = results[i] as { questions: Question[] };
        const level = taxonomyLevels[i];
        
        if (result.questions && result.questions.length > 0) {
            const questionTexts = result.questions.map(q => q.question_text);
            const embeddings = await embeddingModel.embedDocuments(questionTexts);
            const uniqueQuestions = filterSemanticallyUnique(result.questions, embeddings);
            
            const neededForLevel = neededCounts[level];
            finalQuestions.push(...uniqueQuestions.slice(0, neededForLevel));
        }
    }

    // Shuffle the combined questions to ensure a good mix.
    for (let i = finalQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [finalQuestions[i], finalQuestions[j]] = [finalQuestions[j], finalQuestions[i]];
    }

    // Refine the generated quiz with a second AI pass
    const refinedQuiz = await QuizRefinementService.refineQuiz(finalQuestions);
    return refinedQuiz;
}; 