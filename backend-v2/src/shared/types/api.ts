import { z } from 'zod';
import { Request } from 'express';

// Base API Response type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// User types
export interface User {
  id: string;
  google_id: string;
  email: string;
  username: string;
  avatar_url: string;
  created_at: Date;
  updated_at: Date;
}

// Quiz types
export interface Quiz {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  source_type: 'pdf' | 'url' | 'topic' | 'youtube';
  source_data: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question_count: number;
  is_public: boolean;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  created_at: Date;
  updated_at: Date;
}

export interface Question {
  id: string;
  quiz_id: string;
  question: string;
  explanation: string;
  created_at: Date;
  options: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  created_at: Date;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id?: string;
  nickname: string;
  score: number;
  time_taken_seconds: number;
  submitted_at: Date;
}

// Quiz Generation types
export interface QuizGenerationRequest {
  title: string;
  description?: string;
  source_type: 'pdf' | 'url' | 'topic' | 'youtube';
  source_data: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question_count: number;
  taxonomy_level?: 'remembering' | 'understanding' | 'applying' | 'analyzing';
  is_public: boolean;
}

export interface QuizGenerationResponse {
  quizId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  message?: string;
}

export interface QuizGenerationStatus {
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  progress?: number;
  errorMessage?: string;
}

// File Upload types
export interface FileUploadResponse {
  success: boolean;
  source_type: 'pdf';
  source_data: string;
  fileCount: number;
  characterCount: number;
  message: string;
}

// SQS Message types
export interface QuizGenerationMessage {
  quizId: string;
  userId: string;
  generationRequest: QuizGenerationRequest;
  retryCount?: number;
}

// API Schemas
export const quizGenerationSchema = z.object({
  title: z.string().min(2, 'Title must be at least 5 characters long.'),
  description: z.string().optional(),
  source_type: z.enum(['pdf', 'url', 'topic', 'youtube']),
  source_data: z.string().min(3, 'The source must be at least 3 characters long.'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  question_count: z.number().min(3).max(10),
  taxonomy_level: z.enum(['remembering', 'understanding', 'applying', 'analyzing']).optional(),
  is_public: z.boolean(),
});

export const quizSubmissionSchema = z.object({
  quizId: z.string().uuid(),
  answers: z.record(z.string().uuid(), z.string().uuid()),
  nickname: z.string().max(20).nullable(),
  timeTaken: z.number().int().positive(),
});

// Request types with user context
export interface QuizRequest extends Request {
  params: {
    quizId: string;
  };
} 