import { SQSEvent, SQSRecord, Context, SQSHandler } from 'aws-lambda';
import { createFunctionLogger } from '../../shared/utils/logger.js';
import { getClient } from '../../shared/utils/database.js';
import { QuizGenerationMessage } from '../../shared/types/api.js';
import { generateQuizFromSource } from '../../services/quiz/quizGenerationService.js';
import { QuizPersistenceService } from '../../services/quiz/quizPersistenceService.js';
import { ArticleScrapingService } from '../../services/quiz/articleScrapingService.js';

const logger = createFunctionLogger('quiz-generation-worker');

export const handler: SQSHandler = async (event: SQSEvent, context: Context) => {
  logger.info('Quiz generation worker started', { 
    messageCount: event.Records.length,
    requestId: context.awsRequestId 
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
    logger.info('Processing quiz generation message', { messageId });

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
        await updateQuizStatus(quizId, 'FAILED', `Article processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return;
      }
    }

    // Generate the quiz
    logger.info({ userId, quizId, sourceType: generationRequest.source_type }, 'Starting quiz generation');
    
    const questionsPayload = await generateQuizFromSource(
      generationRequest.difficulty,
      generationRequest.question_count,
      sourceData,
      generationRequest.taxonomy_level
    );

    // Save the generated quiz to the database
    const quizData = {
      user_id: userId,
      title: generationRequest.title,
      description: generationRequest.description,
      source_type: generationRequest.source_type,
      source_data: sourceData,
      difficulty: generationRequest.difficulty,
      question_count: generationRequest.question_count,
      is_public: generationRequest.is_public,
    };

    await QuizPersistenceService.saveGeneratedQuiz(quizData, questionsPayload as any);

    // Update quiz status to completed
    await updateQuizStatus(quizId, 'COMPLETED');

    logger.info({ userId, quizId }, 'Quiz generation completed successfully');

  } catch (error) {
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

    // Update quiz status to failed
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during quiz generation';
    await updateQuizStatus(quizId, 'FAILED', errorMessage);
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
        'UPDATE quizzes SET status = $1, updated_at = NOW() WHERE id = $3',
        [status, quizId]
      );
    }
    
    logger.info('Quiz status updated', { quizId, status, errorMessage });
  } finally {
    client.release();
  }
} 