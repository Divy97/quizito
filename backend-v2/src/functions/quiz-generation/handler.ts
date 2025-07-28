import express from 'express';
import serverless from 'serverless-http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { corsMiddleware } from '../../shared/middleware/cors.js';
import { authenticateToken } from '../../shared/middleware/auth.js';
import { sendSuccess, sendError, sendValidationError } from '../../shared/utils/response.js';
import { createFunctionLogger } from '../../shared/utils/logger.js';
import { getClient } from '../../shared/utils/database.js';
import { quizGenerationSchema, QuizGenerationRequest, QuizGenerationResponse } from '../../shared/types/api.js';
import { SQS } from 'aws-sdk';

const app = express();
const logger = createFunctionLogger('quiz-generation-service');
const sqs = new SQS();

// Middleware
app.use(corsMiddleware);
app.use(bodyParser.json());
app.use(cookieParser());

// Health check endpoint
app.get('/health', (_req, res) => {
  sendSuccess(res, { status: 'healthy', service: 'quiz-generation-service' });
});

// Quiz generation endpoint - now handles async processing
app.post('/generate', authenticateToken, async (req, res) => {
  const userId = req.user?.id;
  logger.info({ userId }, 'Quiz generation request received');

  try {
    // Validate request body
    const validation = quizGenerationSchema.safeParse(req.body);
    if (!validation.success) {
      logger.warn({ userId, errors: validation.error.flatten().fieldErrors }, 'Quiz generation validation failed');
      sendValidationError(res, validation.error.flatten().fieldErrors);
      return;
    }

    const generationRequest: QuizGenerationRequest = validation.data;

    // Create quiz record with PENDING status
    const client = await getClient();
    let quizId: string;

    try {
      const result = await client.query(
        `INSERT INTO quizzes (user_id, title, description, source_type, source_data, difficulty, question_count, is_public, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          userId,
          generationRequest.title,
          generationRequest.description,
          generationRequest.source_type,
          generationRequest.source_data,
          generationRequest.difficulty,
          generationRequest.question_count,
          generationRequest.is_public,
          'PENDING'
        ]
      );

      quizId = result.rows[0].id;
      logger.info({ userId, quizId }, 'Quiz record created with PENDING status');
    } finally {
      client.release();
    }

    // Send message to SQS queue for async processing
    const message = {
      quizId,
      userId,
      generationRequest,
      retryCount: 0
    };

    const queueUrl = process.env.QUIZ_GENERATION_QUEUE_URL;
    if (!queueUrl) {
      logger.error('QUIZ_GENERATION_QUEUE_URL environment variable not set');
      sendError(res, 'Configuration error', 500);
      return;
    }

    await sqs.sendMessage({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(message),
      MessageAttributes: {
        'quizId': {
          DataType: 'String',
          StringValue: quizId
        },
        'userId': {
          DataType: 'String',
          StringValue: userId!
        }
      }
    }).promise();

    logger.info({ userId, quizId }, 'Quiz generation message sent to SQS queue');

    // Return immediate response
    const response: QuizGenerationResponse = {
      quizId,
      status: 'PENDING',
      message: 'Quiz generation started. You will be notified when it is ready.'
    };

    sendSuccess(res, response, 'Quiz generation initiated', 202);

  } catch (error) {
    logger.error({ userId, error }, 'Error in quiz generation endpoint');
    sendError(res, 'Failed to initiate quiz generation', 500);
  }
});

// Quiz status endpoint
app.get('/:quizId/status', async (req, res) => {
  const { quizId } = req.params;
  const userId = req.user?.id;

  if (!quizId) {
    sendError(res, 'Quiz ID is required', 400);
    return;
  }

  try {
    const client = await getClient();
    
    try {
      const result = await client.query(
        'SELECT status, error_message FROM quizzes WHERE id = $1 AND user_id = $2',
        [quizId, userId]
      );

      if (result.rows.length === 0) {
        sendError(res, 'Quiz not found', 404);
        return;
      }

      const quiz = result.rows[0];
      sendSuccess(res, {
        status: quiz.status,
        errorMessage: quiz.error_message
      });

    } finally {
      client.release();
    }

  } catch (error) {
    logger.error({ userId, quizId, error }, 'Error fetching quiz status');
    sendError(res, 'Failed to fetch quiz status', 500);
  }
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response) => {
  logger.error('Unhandled error in quiz generation service', { error: err.message, stack: err.stack });
  sendError(res, 'Internal server error', 500);
});

// 404 handler
app.use('*', (_req, res) => {
  sendError(res, 'Route not found', 404);
});

export const handler = serverless(app, {
  basePath: '/quizzes'
}); 