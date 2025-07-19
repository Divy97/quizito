import { ChatAnthropic } from '@langchain/anthropic';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { quizSchema } from '../types/quizSchemas.js';
import { Question } from '../utils/similarity.js';

const parser = StructuredOutputParser.fromZodSchema(quizSchema as any);

const getReviewerPromptTemplate = (): ChatPromptTemplate => {
  const systemPrompt = `
<Persona>
You are an expert editor, pedagogue, and subject-matter expert. Your task is to review and refine an existing quiz to elevate it to a world-class standard. You are meticulous, critical, and have a deep understanding of nuance.
</Persona>

<Task>
Review the provided <InputQuiz> JSON. Your goal is to improve its quality by performing the following checks and enhancements. You will output a new JSON object in the exact same format as the input, but with your improvements applied.

1.  **Factual Accuracy & Nuance Check**:
    - For each question, scrutinize the selected correct answer. Is it the most precise and nuanced answer, especially for a "Hard" difficulty level?
    - Correct any subtle inaccuracies. For questions asking for an application of a concept (e.g., 'blitzkrieg'), ensure the scenario and correct answer represent a true application, not just a superficial understanding.

2.  **Distractor Sophistication Check**:
    - For each question, evaluate the incorrect options (distractors). Are they too obviously wrong?
    - Replace at least one distractor per question with a more sophisticated, plausible alternative that would genuinely challenge an advanced student. A good sophisticated distractor is often partially true or true in a different context.

3.  **Explanation Depth Check**:
    - Review the explanation for each question. Does it merely define the term, or does it explain the reasoning?
    - Enhance each explanation. It should clarify why the correct answer is correct *in the context of the question* and, if possible, briefly explain why a key distractor is incorrect.

4.  **Consistency Check**:
    - Ensure every single question has a non-empty explanation field.

Your final output MUST be the complete, refined quiz in the same JSON structure as the <InputQuiz>.
</Task>

<OutputInstructions>
{format_instructions}
</OutputInstructions>
`;

  return ChatPromptTemplate.fromMessages([
    ['system', systemPrompt],
    ['human', '<InputQuiz>\n{quiz_json}\n</InputQuiz>'],
  ]);
};

export class QuizRefinementService {
  static async refineQuiz(questions: Question[]): Promise<{ questions: Question[] }> {
    const model = new ChatAnthropic({
      model: 'claude-3-5-sonnet-20240620',
      temperature: 0.2, // Low temperature for focused, analytical refinement
    });

    const prompt = getReviewerPromptTemplate();
    const chain = prompt.pipe(model).pipe(parser);
    const quizJson = JSON.stringify({ questions });

    const refinedQuiz = await chain.invoke({
      quiz_json: quizJson,
      format_instructions: parser.getFormatInstructions(),
    }) as { questions: Question[] };

    return refinedQuiz;
  }
} 