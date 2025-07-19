import { Request, Response } from 'express';
import pool from '../config/database.js';
import logger from '../config/logger.js';
import { z } from 'zod';
import { generateQuizFromSource } from '../services/quizGenerationService.js';
import { quizGenAPISchema, submitQuizAPISchema } from '../types/quizSchemas.js';
import { QuizPersistenceService } from '../services/quizPersistenceService.js';
import { ArticleScrapingService } from '../services/articleScrapingService.js';

export const generateQuiz = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  logger.info({ userId }, 'Quiz generation process started.');

  try {
    const validation = quizGenAPISchema.safeParse(req.body);
    if (!validation.success) {
      logger.warn({ userId, errors: validation.error.flatten().fieldErrors }, 'Quiz generation validation failed.');
      res.status(400).json({ error: validation.error.flatten().fieldErrors });
      return;
    }

    const { source_type, difficulty, question_count, taxonomy_level, ...restOfQuizData } = validation.data;
    let { source_data } = validation.data;
    
    // Handle different source types
    if (source_type === 'pdf') {
      // For PDF source type, we expect the source_data to be the extracted text from the PDF
      if (!source_data) {
        logger.warn({ userId, source_type }, 'Missing extracted text from PDF');
        res.status(400).json({ error: 'Missing extracted text from PDF' });
        return;
      }
    } else if (source_type === 'url') {
      // For article source type, we expect source_data to be a URL
      if (!source_data) {
        logger.warn({ userId, source_type }, 'Missing article URL');
        res.status(400).json({ error: 'Article URL is required' });
        return;
      }
      
      try {
        // Validate URL format
        new URL(source_data);
        
        // Extract article content
        logger.info({ userId, url: source_data }, 'Extracting article content');
        const articleContent = await ArticleScrapingService.extractArticleContent(source_data);
        
        if (!articleContent) {
          logger.warn({ userId, url: source_data }, 'Failed to extract article content');
          res.status(400).json({ error: 'Could not extract content from the provided article URL' });
          return;
        }
        
        // Use the extracted content for quiz generation
        source_data = articleContent;
      } catch (error) {
        logger.error({ userId, url: source_data, error }, 'Error processing article URL');
        const errorMessage = error instanceof Error ? error.message : 'Invalid URL or error fetching article';
        res.status(400).json({ error: `Article processing failed: ${errorMessage}` });
        return;
      }
    } else if (!source_data) {
      // For other source types, ensure source_data is provided
      logger.warn({ userId, source_type }, 'Missing source data for quiz generation');
      res.status(400).json({ error: 'Missing source data' });
      return;
    }
    
    // 1. Generate questions from the AI service
    logger.info({ userId, source_type, difficulty, taxonomy_level }, 'Invoking quiz generation service.');
    const questionsPayload = await generateQuizFromSource(
      difficulty,
      question_count,
      source_data,
      taxonomy_level
    );
    
    // 2. Persist the generated quiz to the database
    const quizData = { 
      user_id: userId, 
      ...restOfQuizData, 
      source_type,
      source_data, 
      difficulty, 
      question_count 
    };
    const quizId = await QuizPersistenceService.saveGeneratedQuiz(quizData, questionsPayload as any);

    logger.info({ userId, quizId }, 'Quiz generation process completed successfully.');
    res.status(201).json({ quizId });

  } catch (error) {
    logger.error({ userId, error }, 'An error occurred during quiz generation.');
    if (error instanceof z.ZodError) {
      res.status(422).json({ error: 'Invalid payload from AI model.' });
    } else {
      res.status(500).json({ error: 'An unexpected error occurred.' });
    }
  }
};

export const deleteQuiz = async (req: Request, res: Response): Promise<void> => {
  const { quizId } = req.params;
  const userId = req.user?.id;

  logger.info({ userId, quizId }, 'Attempting to delete quiz.');

  if (!quizId) {
    logger.warn({ userId }, 'Delete quiz failed: Missing quizId.');
    res.status(400).json({ error: 'Quiz ID is required.' });
    return;
  }

  try {
    // user can only delete their own quiz.
    const deleteResult = await pool.query(
      'DELETE FROM quizzes WHERE id = $1 AND user_id = $2',
      [quizId, userId]
    );

    if (deleteResult.rowCount === 0) {
      logger.warn({ userId, quizId }, 'Delete quiz failed: Quiz not found or user does not have permission.');
      res.status(404).json({ error: 'Quiz not found or you do not have permission to delete it.' });
      return;
    }

    logger.info({ userId, quizId }, 'Quiz deleted successfully.');
    res.status(200).json({ message: 'Quiz deleted successfully.' });

  } catch (error) {
    logger.error({ userId, quizId, error }, 'An unexpected error occurred while deleting quiz.');
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

export const submitQuiz = async (req: Request, res: Response): Promise<void> => {
  const validation = submitQuizAPISchema.safeParse(req.body);
  const userId = req.user?.id;

  if (!validation.success) {
    logger.warn({ userId, errors: validation.error.flatten().fieldErrors }, 'Quiz submission validation failed.');
    res.status(400).json({ error: validation.error.flatten().fieldErrors });
    return;
  }

  const { quizId, answers, nickname, timeTaken } = validation.data;
  logger.info({ userId, quizId, nickname }, 'Quiz submission received.');
  
  const client = await pool.connect();

  try {
    // 1. Fetch quiz to check visibility and ownership
    const quizResult = await client.query('SELECT is_public, user_id FROM quizzes WHERE id = $1', [quizId]);

    if (quizResult.rowCount === 0) {
      logger.warn({ userId, quizId }, 'Quiz submission failed: Quiz not found.');
      res.status(404).json({ error: 'Quiz not found.' });
      return;
    }
    
    const quiz = quizResult.rows[0];
    const isOwner = userId === quiz.user_id;

    // Security Check: Block submission to private quizzes by non-owners
    if (!quiz.is_public && !isOwner) {
      logger.warn({ userId, quizId }, 'Quiz submission failed: Attempted to submit to a private quiz without ownership.');
      res.status(403).json({ error: 'You do not have permission to submit to this quiz.' });
      return;
    }

    // Validation: Nickname is required for public, non-owner submissions
    if (quiz.is_public && !isOwner && !nickname) {
      logger.warn({ userId, quizId }, 'Quiz submission failed: Nickname is required for public quizzes.');
      res.status(400).json({ error: 'Nickname is required for public quizzes.' });
      return;
    }
    
    // 2. Grade the quiz
    const questionIds = Object.keys(answers);
    const correctOptionsQuery = await client.query(
      `SELECT q.id AS question_id, q.explanation, o.id AS correct_option_id
       FROM questions q
       JOIN question_options o ON q.id = o.question_id
       WHERE q.quiz_id = $1 AND q.id = ANY($2::uuid[]) AND o.is_correct = TRUE`,
       [quizId, questionIds]
    );

    const correctOptionsMap = new Map(correctOptionsQuery.rows.map(row => [row.question_id, { correctOptionId: row.correct_option_id, explanation: row.explanation }]));
    
    let score = 0;
    const results = questionIds.map(questionId => {
        const selectedOptionId = answers[questionId];
        const correctInfo = correctOptionsMap.get(questionId);
        const isCorrect = correctInfo?.correctOptionId === selectedOptionId;
        if (isCorrect) score++;
        return {
            questionId,
            selectedOptionId,
            correctOptionId: correctInfo?.correctOptionId || '',
            isCorrect,
            explanation: correctInfo?.explanation || 'No explanation available.',
        };
    });

    // 3. Save the attempt
    const finalNickname = isOwner ? (req.user?.username || 'Creator') : nickname!;
    const finalScore = (score / questionIds.length) * 100;

    await client.query(
        `INSERT INTO quiz_attempts (quiz_id, user_id, nickname, score, time_taken_seconds)
         VALUES ($1, $2, $3, $4, $5)`,
        [quizId, userId ?? null, finalNickname, Math.round(finalScore), Math.round(timeTaken)]
    );
    logger.info({ userId, quizId, score: finalScore }, 'Quiz attempt saved successfully.');
    
    // 4. Fetch leaderboard if public
    let leaderboard = [];
    if (quiz.is_public) {
        const leaderboardResult = await client.query(
            `SELECT nickname, score, time_taken_seconds FROM quiz_attempts
             WHERE quiz_id = $1 ORDER BY score DESC, time_taken_seconds ASC LIMIT 10`,
            [quizId]
        );
        leaderboard = leaderboardResult.rows;
    }

    res.status(200).json({
        totalQuestions: questionIds.length,
        correctAnswers: score,
        score: finalScore,
        results,
        leaderboard,
    });

  } catch (error) {
    logger.error({ userId, quizId, error }, 'An unexpected error occurred during quiz submission.');
    res.status(500).json({ error: 'An unexpected error occurred.' });
  } finally {
    client.release();
  }
};

export const getMyQuizzes = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  logger.info({ userId }, 'Fetching quizzes for user.');

  try {
    const { rows } = await pool.query(
      `SELECT 
        q.id, q.title, q.description, q.question_count, q.created_at,
        COALESCE(json_agg(json_build_object('id', a.id, 'score', a.score, 'submitted_at', a.submitted_at)) FILTER (WHERE a.id IS NOT NULL), '[]') as quiz_attempts
       FROM quizzes q
       LEFT JOIN quiz_attempts a ON q.id = a.quiz_id
       WHERE q.user_id = $1
       GROUP BY q.id
       ORDER BY q.created_at DESC`,
      [userId]
    );
    res.status(200).json(rows);
  } catch (error) {
    logger.error({ userId, error }, 'An error occurred while fetching user quizzes.');
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

export const getQuizById = async (req: Request, res: Response): Promise<void> => {
  const { quizId } = req.params;
  const userId = req.user?.id; // This might be undefined due to soft auth
  
  if (!quizId || quizId === 'undefined') {
    logger.warn({ userId, quizId }, 'Invalid quiz ID provided');
    res.status(400).json({ error: 'Quiz ID is required' });
    return;
  }
  
  logger.info({ userId, quizId }, 'Fetching quiz by ID.');

  try {
    // First, get the quiz and check ownership/visibility
    const quizResult = await pool.query('SELECT * FROM quizzes WHERE id = $1', [quizId]);
    if (quizResult.rowCount === 0) {
      res.status(404).json({ error: 'Quiz not found.' });
      return;
    }

    const quiz = quizResult.rows[0];
    const isOwner = userId === quiz.user_id;

    if (!quiz.is_public && !isOwner) {
      res.status(403).json({ error: 'You do not have permission to view this quiz.' });
      return;
    }

    // Now, fetch the questions and options for this quiz
    const questionsResult = await pool.query(
        `SELECT q.id, q.question, q.explanation, 
         COALESCE(json_agg(json_build_object('id', o.id, 'option_text', o.option_text)) FILTER (WHERE o.id IS NOT NULL), '[]') as options,
         (SELECT o_correct.id FROM question_options o_correct WHERE o_correct.question_id = q.id AND o_correct.is_correct = TRUE LIMIT 1) as "correctOptionId"
         FROM questions q
         LEFT JOIN question_options o ON q.id = o.question_id
         WHERE q.quiz_id = $1
         GROUP BY q.id
         ORDER BY (SELECT MIN(o_inner.created_at) FROM question_options o_inner WHERE o_inner.question_id = q.id)`,
        [quizId]
    );

    let leaderboard = [];
    if (quiz.is_public) {
        const leaderboardResult = await pool.query(
            `SELECT nickname, score, time_taken_seconds FROM quiz_attempts
             WHERE quiz_id = $1 ORDER BY score DESC, time_taken_seconds ASC LIMIT 10`,
            [quizId]
        );
        leaderboard = leaderboardResult.rows;
    }

    const finalQuizData = {
      ...quiz,
      questions: questionsResult.rows,
      isOwner,
      leaderboard,
    };

    res.status(200).json(finalQuizData);

  } catch (error) {
    logger.error({ userId, quizId, error }, 'An error occurred while fetching quiz by ID.');
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};