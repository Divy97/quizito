import { z } from 'zod';

// AI Generation Schemas
export const optionSchema = z.object({
  option_text: z.string().describe("The text for a potential answer choice."),
  is_correct: z.boolean().describe("Indicates if this is the correct answer."),
});

export const questionSchema = z.object({
  question_text: z.string().describe('The question text.'),
  source_quote: z.string().describe('The exact sentence or phrase from the source text that justifies the correct answer.'),
  explanation: z
    .string()
    .describe('A brief explanation of why the correct answer is correct.'),
  options: z.array(optionSchema).min(4).max(4).describe("An array of exactly four answer options, with one marked as correct."),
});

export const quizSchema = z.object({
  questions: z
    .array(questionSchema)
    .describe('An array of question objects for the quiz.'),
});

// Base schema with common fields
const baseQuizSchema = {
  title: z.string().min(5, 'Title must be at least 5 characters long.'),
  description: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  taxonomy_level: z.enum(['remembering', 'understanding', 'applying', 'analyzing']).optional(),
  question_count: z.number().min(3).max(10),
  is_public: z.boolean(),
};

// Schema for non-PDF sources
const nonPdfSourceSchema = z.object({
  ...baseQuizSchema,
  source_type: z.enum(['topic', 'youtube', 'url']),
  source_data: z.string().min(3, 'The source must be at least 3 characters long.'),
});

// Schema for PDF source
const pdfSourceSchema = z.object({
  ...baseQuizSchema,
  source_type: z.literal('pdf'),
  source_data: z.string().min(0).optional(), // Allow empty string for PDFs
});

// Combined schema using discriminated union
export const quizGenAPISchema = z.discriminatedUnion('source_type', [
  nonPdfSourceSchema,
  pdfSourceSchema,
]);

export const submitQuizAPISchema = z.object({
  quizId: z.string().uuid(),
  answers: z.record(z.string().uuid(), z.string().uuid()),
  nickname: z.string().min(3).max(20).nullable(),
  timeTaken: z.number().int().positive(),
}); 