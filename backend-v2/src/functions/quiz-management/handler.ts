import express from 'express';
import serverless from 'serverless-http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { corsMiddleware } from '../../shared/middleware/cors.js';
import { authenticateToken, softAuthenticateToken } from '../../shared/middleware/auth.js';
import { sendSuccess, sendError, sendValidationError } from '../../shared/utils/response.js';
import { createFunctionLogger } from '../../shared/utils/logger.js';
import { getClient } from '../../shared/utils/database.js';
import { quizSubmissionSchema } from '../../shared/types/api.js';

const app = express();
const logger = createFunctionLogger('quiz-management-service');

// Middleware
app.use(corsMiddleware);
app.use(bodyParser.json());
app.use(cookieParser());

// Handle preflight requests
app.options('*', corsMiddleware);

// Health check endpoint
app.get('/health', (_req, res) => {
  sendSuccess(res, { status: 'healthy', service: 'quiz-management-service' });
});

// GET /quizzes/my-quizzes - Get all quizzes for the logged-in user
app.get('/my-quizzes', authenticateToken, async (req, res) => {
  const userId = req.user?.id;
  logger.info({ userId }, 'Fetching quizzes for user');

  try {
    const client = await getClient();
    
    try {
      const result = await client.query(
        `SELECT 
          q.id, q.title, q.description, q.question_count, q.created_at, q.status,
          COALESCE(json_agg(json_build_object('id', a.id, 'score', a.score, 'submitted_at', a.submitted_at)) FILTER (WHERE a.id IS NOT NULL), '[]') as quiz_attempts
         FROM quizzes q
         LEFT JOIN quiz_attempts a ON q.id = a.quiz_id
         WHERE q.user_id = $1
         GROUP BY q.id
         ORDER BY q.created_at DESC`,
        [userId]
      );
      
      sendSuccess(res, result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error({ userId, error }, 'Error fetching user quizzes');
    sendError(res, 'Failed to fetch quizzes', 500);
  }
});

// GET /quizzes/:quizId - Get a single quiz by its ID
app.get('/:quizId', softAuthenticateToken, async (req, res) => {
  const { quizId } = req.params;
  const userId = req.user?.id;

  if (!quizId || quizId === 'undefined') {
    logger.warn({ userId, quizId }, 'Invalid quiz ID provided');
    sendError(res, 'Quiz ID is required', 400);
    return;
  }

  logger.info({ userId, quizId }, 'Fetching quiz by ID');

  try {
    const client = await getClient();
    
    try {
      // First, get the quiz and check ownership/visibility
      const quizResult = await client.query('SELECT * FROM quizzes WHERE id = $1', [quizId]);
      if (quizResult.rows.length === 0) {
        sendError(res, 'Quiz not found', 404);
        return;
      }

      const quiz = quizResult.rows[0];
      const isOwner = userId === quiz.user_id;

      if (!quiz.is_public && !isOwner) {
        sendError(res, 'You do not have permission to view this quiz', 403);
        return;
      }

      // Now, fetch the questions and options for this quiz
      const questionsResult = await client.query(
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
        const leaderboardResult = await client.query(
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

      sendSuccess(res, finalQuizData);
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error({ userId, quizId, error }, 'Error fetching quiz by ID');
    sendError(res, 'Failed to fetch quiz', 500);
  }
});

// POST /quizzes/submit - Submits a quiz for grading
app.post('/submit', softAuthenticateToken, async (req, res) => {
  const validation = quizSubmissionSchema.safeParse(req.body);
  const userId = req.user?.id;

  if (!validation.success) {
    logger.warn({ userId, errors: validation.error.flatten().fieldErrors }, 'Quiz submission validation failed');
    sendValidationError(res, validation.error.flatten().fieldErrors);
    return;
  }

  const { quizId, answers, nickname, timeTaken } = validation.data;
  logger.info({ userId, quizId, nickname }, 'Quiz submission received');

  const client = await getClient();

  try {
    // 1. Fetch quiz to check visibility and ownership
    const quizResult = await client.query('SELECT is_public, user_id FROM quizzes WHERE id = $1', [quizId]);

    if (quizResult.rows.length === 0) {
      logger.warn({ userId, quizId }, 'Quiz submission failed: Quiz not found');
      sendError(res, 'Quiz not found', 404);
      return;
    }

    const quiz = quizResult.rows[0];
    const isOwner = userId === quiz.user_id;

    // Security Check: Block submission to private quizzes by non-owners
    if (!quiz.is_public && !isOwner) {
      logger.warn({ userId, quizId }, 'Quiz submission failed: Attempted to submit to a private quiz without ownership');
      sendError(res, 'You do not have permission to submit to this quiz', 403);
      return;
    }

    // Validation: Nickname is required for public, non-owner submissions
    if (quiz.is_public && !isOwner && !nickname) {
      logger.warn({ userId, quizId }, 'Quiz submission failed: Nickname is required for public quizzes');
      sendError(res, 'Nickname is required for public quizzes', 400);
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
    logger.info({ userId, quizId, score: finalScore }, 'Quiz attempt saved successfully');

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

    sendSuccess(res, {
      totalQuestions: questionIds.length,
      correctAnswers: score,
      score: finalScore,
      results,
      leaderboard,
    });
  } catch (error) {
    logger.error({ userId, quizId, error }, 'Error during quiz submission');
    sendError(res, 'Failed to submit quiz', 500);
  } finally {
    client.release();
  }
});

// DELETE /quizzes/:quizId - Deletes a quiz
app.delete('/:quizId', authenticateToken, async (req, res) => {
  const { quizId } = req.params;
  const userId = req.user?.id;

  logger.info({ userId, quizId }, 'Attempting to delete quiz');

  if (!quizId) {
    logger.warn({ userId }, 'Delete quiz failed: Missing quizId');
    sendError(res, 'Quiz ID is required', 400);
    return;
  }

  try {
    const client = await getClient();
    
    try {
      // user can only delete their own quiz
      const deleteResult = await client.query(
        'DELETE FROM quizzes WHERE id = $1 AND user_id = $2',
        [quizId, userId]
      );

      if (deleteResult.rowCount === 0) {
        logger.warn({ userId, quizId }, 'Delete quiz failed: Quiz not found or user does not have permission');
        sendError(res, 'Quiz not found or you do not have permission to delete it', 404);
        return;
      }

      logger.info({ userId, quizId }, 'Quiz deleted successfully');
      sendSuccess(res, { message: 'Quiz deleted successfully' });
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error({ userId, quizId, error }, 'Error deleting quiz');
    sendError(res, 'Failed to delete quiz', 500);
  }
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response) => {
  logger.error('Unhandled error in quiz management service', { error: err.message, stack: err.stack });
  sendError(res, 'Internal server error', 500);
});

// 404 handler
app.use('*', (_req, res) => {
  sendError(res, 'Route not found', 404);
});

export const handler = serverless(app, {
  basePath: '/quizzes'
}); 