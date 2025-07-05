import { ChatAnthropic } from '@langchain/anthropic';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { quizSchema } from '../types/quizSchemas';
import { Runnable } from '@langchain/core/runnables';

const model = new ChatAnthropic({
  model: 'claude-3-5-sonnet-20240620',
  temperature: 0.7,
});

const parser = StructuredOutputParser.fromZodSchema(quizSchema as any);

const quizGenerationPromptTemplate = ChatPromptTemplate.fromMessages([
  ['system', 
  `You are an expert educator and quiz designer.
  Your task is to generate a complete quiz based on the user's topic.
  The quiz should be of {difficulty} difficulty and contain exactly {question_count} multiple-choice questions.
  Each question must have exactly 4 options, with one correct answer.
  For each question, also provide a brief explanation for the correct answer.
  {format_instructions}`
  ],
  ['human', 'Topic: {topic}'],
]);

let quizGenerationChain: Runnable<any, any>;

export const getQuizGenerationChain = async () => {
  if (quizGenerationChain) {
    return quizGenerationChain;
  }

  const quizGenerationPrompt = await quizGenerationPromptTemplate.partial({
      format_instructions: parser.getFormatInstructions(),
  });

  quizGenerationChain = quizGenerationPrompt.pipe(model).pipe(parser);
  return quizGenerationChain;
}; 