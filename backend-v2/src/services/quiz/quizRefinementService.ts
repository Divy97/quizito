import { quizSchema, quizJsonSchema } from '../../shared/types/quizSchemas.js';
import { Question } from '../../shared/utils/similarity.js';
import { OpenRouterService } from '../ai/openRouterService.js';

const getReviewerPrompt = (): string => {
  return `
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
Return ONLY a single JSON object — no prose, no markdown fences, no commentary.

The JSON object MUST match the shape of <InputQuiz>:
{
  "questions": [
    {
      "question_text": "...",
      "source_quote": "...",
      "explanation": "...",
      "options": [
        { "option_text": "...", "is_correct": false },
        { "option_text": "...", "is_correct": true },
        { "option_text": "...", "is_correct": false },
        { "option_text": "...", "is_correct": false }
      ]
    }
  ]
}

Key-name rules (non-negotiable):
- Use the exact keys: "questions", "question_text", "source_quote", "explanation", "options", "option_text", "is_correct".
- Do NOT rename, translate, abbreviate, or omit any key.
- Do NOT use an empty string "" as a key.
- Every question MUST contain all four fields; every option MUST contain both fields.
- "options" MUST have exactly 4 entries; exactly one MUST have "is_correct": true.
</OutputInstructions>
`;
};

export class QuizRefinementService {
  static async refineQuiz(
    questions: Question[],
    openRouterApiKey: string,
    aiModel: string | undefined,
    userId: string
  ): Promise<{ questions: Question[] }> {
    const quizJson = JSON.stringify({ questions });

    const rawJson = await OpenRouterService.chatJson<unknown>({
      apiKey: openRouterApiKey,
      model: aiModel,
      temperature: 0.2,
      userId,
      jsonSchema: { name: 'quiz', schema: quizJsonSchema as unknown as Record<string, unknown> },
      messages: [
        {
          role: 'system',
          content: getReviewerPrompt(),
        },
        {
          role: 'user',
          content: `<InputQuiz>\n${quizJson}\n</InputQuiz>`,
        },
      ],
    });

    return quizSchema.parse(rawJson) as { questions: Question[] };
  }
}
