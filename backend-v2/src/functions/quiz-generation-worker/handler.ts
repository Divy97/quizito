import { SQSEvent, SQSRecord, Context, SQSHandler } from 'aws-lambda';
import { createFunctionLogger } from '../../shared/utils/logger.js';
import { getClient } from '../../shared/utils/database.js';
import { QuizGenerationMessage } from '../../shared/types/api.js';
import { generateQuizFromSource } from '../../services/quiz/quizGenerationService.js';
import { QuizPersistenceService } from '../../services/quiz/quizPersistenceService.js';
import { ArticleScrapingService } from '../../services/quiz/articleScrapingService.js';
import { AiKeyService } from '../../services/ai/aiKeyService.js';

const logger = createFunctionLogger('quiz-generation-worker');

// Map internal exceptions to a short, user-safe message. We always log the
// original error for ops; only the return value is persisted/shown to users.
function toUserFacingError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error ?? '');

  if (/OpenRouter request failed: 401/i.test(raw)) {
    return 'Your AI provider key was rejected. Please re-check it in settings and try again.';
  }
  if (/OpenRouter request failed: 402/i.test(raw) || /insufficient.*credit|quota/i.test(raw)) {
    return 'Your AI provider account is out of credits or quota. Top up and try again.';
  }
  if (/OpenRouter request failed: 429/i.test(raw) || /rate.?limit/i.test(raw)) {
    return 'The AI provider is rate-limiting requests right now. Please try again in a moment.';
  }
  if (/OpenRouter request failed: 5\d\d/i.test(raw) || /OpenRouter returned an empty response/i.test(raw)) {
    return 'The AI provider is temporarily unavailable. Please try again.';
  }
  if (/Article processing failed/i.test(raw) || /Could not extract content/i.test(raw)) {
    return 'We could not extract readable content from that URL. Try a different article or paste the text directly.';
  }
  if (/OUTPUT_PARSING_FAILURE/i.test(raw) || /Failed to parse/i.test(raw) || /ZodError/i.test(raw) || /question_text/i.test(raw)) {
    return 'The AI returned a malformed response. Please try again, or pick a different model.';
  }
  return 'We could not generate this quiz. Please try again, or pick a different model.';
}

export const handler: SQSHandler = async (event: SQSEvent, context: Context) => {
  logger.info('Quiz generation worker started', {
    messageCount: event.Records.length,
    requestId: context.awsRequestId,
    remainingTime: context.getRemainingTimeInMillis()
  });

  for (const record of event.Records) {
    await processQuizGenerationMessage(record, context);
  }
};

async function processQuizGenerationMessage(record: SQSRecord, context: Context): Promise<void> {
  const messageId = record.messageId;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const receiptHandle = record.receiptHandle;

  try {
    logger.info('Processing quiz generation message', {
      messageId,
      remainingTime: context.getRemainingTimeInMillis()
    });

    // Parse the message
    const message: QuizGenerationMessage = JSON.parse(record.body);
    const { quizId, userId, generationRequest, retryCount = 0 } = message;

    logger.info('Quiz generation message parsed', {
      quizId,
      userId,
      retryCount,
      requestId: context.awsRequestId
    });

    // Update quiz status to processing
    await updateQuizStatus(quizId, 'PROCESSING');

    // Process the source data if needed
    let sourceData = generationRequest.source_data;

    if (generationRequest.source_type === 'url') {
      try {
        logger.info({ userId, url: sourceData }, 'Extracting article content');
        const articleContent = await ArticleScrapingService.extractArticleContent(sourceData);

        if (!articleContent) {
          throw new Error('Could not extract content from the provided article URL');
        }

        sourceData = articleContent;
      } catch (error) {
        logger.error({ userId, url: sourceData, error }, 'Error processing article URL');
        await updateQuizStatus(
          quizId,
          'FAILED',
          'We could not extract readable content from that URL. Try a different article or paste the text directly.'
        );
        return;
      }
    }

    // Generate the quiz
    logger.info({ userId, quizId, sourceType: generationRequest.source_type }, 'Starting quiz generation');

    let questionsPayload;
    try {
      const credentials = await AiKeyService.resolveCredentials(userId);
      logger.info({
        userId,
        quizId,
        difficulty: generationRequest.difficulty,
        questionCount: generationRequest.question_count,
        aiProvider: generationRequest.ai_provider ?? 'openrouter',
        aiModel: generationRequest.ai_model,
        usingUserKey: credentials.userKeyProviders.includes('openrouter')
      }, 'Calling generateQuizFromSource');

      questionsPayload = await generateQuizFromSource(
        generationRequest.difficulty,
        generationRequest.question_count,
        sourceData,
        generationRequest.taxonomy_level,
        credentials.openRouterApiKey,
        generationRequest.ai_model,
        userId
      );
      await AiKeyService.markKeysUsed(userId, credentials.userKeyProviders);

      logger.info({ userId, quizId, questionsCount: questionsPayload?.questions?.length }, 'Quiz generation completed, saving to database');
    } catch (error) {
      logger.error('Error in generateQuizFromSource', {
        userId,
        quizId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }

    // Save the generated quiz to the database
    const quizData = {
      user_id: userId,
      title: generationRequest.title,
      description: generationRequest.description,
      source_type: generationRequest.source_type,
      source_data: sourceData,
      difficulty: generationRequest.difficulty,
      question_count: generationRequest.question_count,
      ai_provider: generationRequest.ai_provider ?? 'openrouter',
      ai_model: generationRequest.ai_model,
      is_public: generationRequest.is_public,
    };

    try {
      await QuizPersistenceService.saveGeneratedQuiz(quizData, questionsPayload as any, quizId);
      logger.info({ userId, quizId }, 'Quiz saved to database successfully');
    } catch (error) {
      logger.error('Error saving quiz to database', {
        userId,
        quizId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }

    // Update quiz status to completed
    await updateQuizStatus(quizId, 'COMPLETED');

    logger.info({ userId, quizId }, 'Quiz generation completed successfully');

  } catch (error) {
    console.error('FULL ERROR DETAILS:', error);
    logger.error('Error processing quiz generation message', {
      messageId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      requestId: context.awsRequestId
    });

    // Handle retries
    const message: QuizGenerationMessage = JSON.parse(record.body);
    const { quizId, retryCount = 0 } = message;
    const maxRetries = 3;

    if (retryCount < maxRetries) {
      logger.info('Retrying quiz generation', { quizId, retryCount, maxRetries });
      // we can send the message back to the queue with incremented retry count but for now let's just update the status to failed
    }

    // Update quiz status to failed. Persist a user-friendly message; the raw
    // error stays in the logs above.
    await updateQuizStatus(quizId, 'FAILED', toUserFacingError(error));
  }
}

async function updateQuizStatus(quizId: string, status: 'PROCESSING' | 'COMPLETED' | 'FAILED', errorMessage?: string): Promise<void> {
  const client = await getClient();

  try {
    if (errorMessage) {
      await client.query(
        'UPDATE quizzes SET status = $1, error_message = $2, updated_at = NOW() WHERE id = $3',
        [status, errorMessage, quizId]
      );
    } else {
      await client.query(
        'UPDATE quizzes SET status = $1, updated_at = NOW() WHERE id = $2',
        [status, quizId]
      );
    }

    logger.info('Quiz status updated', { quizId, status, errorMessage });
  } finally {
    client.release();
  }
}
