import { ChatAnthropic } from '@langchain/anthropic';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { BaseMessage } from '@langchain/core/messages';

// Define the schema for a single question, which we'll use for output parsing.
const questionSchema = z.object({
  question: z.string().describe('The question text.'),
  explanation: z
    .string()
    .describe('A brief explanation of why the correct answer is correct.'),
  options: z
    .array(
      z.object({
        option_text: z.string().describe('The text for an answer choice.'),
        is_correct: z.boolean().describe('Whether this option is the correct answer.'),
      })
    )
    .min(4)
    .max(4)
    .describe('An array of exactly four potential answer options.'),
});

// Define the schema for the entire quiz.
const quizSchema = z.object({
  questions: z
    .array(questionSchema)
    .describe('An array of question objects for the quiz.'),
});

// Create a parser that will format the LLM output into our desired structure.
const outputParser = StructuredOutputParser.fromZodSchema(quizSchema);

const researchPrompt = ChatPromptTemplate.fromMessages([
  ['system', 
  `You are an expert researcher and educator.
  Your task is to generate a comprehensive, factual, and well-structured text about the following topic.
  The content must be tailored for a quiz of {difficulty} difficulty.
  The text should be rich and detailed enough to create at least {question_count} distinct multiple-choice questions.
  Do not write the questions themselves. Your only output should be the educational text based on the topic.`
  ],
  ['human', 'Topic: {topic}'],
]);

const questionGenerationPrompt = ChatPromptTemplate.fromMessages([
  ['system', 
  `You are an expert quiz designer.
  Based on the content provided, generate a JSON object that contains exactly {question_count} multiple-choice questions.
  {format_instructions}`
  ],
  ['human', 'Content:\n---\n{source_text}\n---'],
]);

// Initialize the ChatAnthropic model.
// Ensure you have ANTHROPIC_API_KEY set in your environment variables.
const model = new ChatAnthropic({
  model: 'claude-3-5-sonnet-20240620',
  temperature: 0.7,
});

// Export the chains and parser to be used in the API route.
export const researchChain = researchPrompt.pipe(model).pipe({
  invoke: (input: BaseMessage) => input.content as string,
});

export const questionGenerationChain = questionGenerationPrompt.pipe(model).pipe(outputParser);

export { outputParser }; 