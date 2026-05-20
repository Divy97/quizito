import pool from '../../shared/config/database.js';


interface QuestionPayload {
  question_text: string;
  source_quote: string;
  explanation: string;
  options: {
    option_text: string;
    is_correct: boolean;
  }[];
}

interface QuizData {
    user_id: string | undefined;
    title: string;
    description?: string | undefined;
    source_type: string;
    source_data: string;
    difficulty: string;
    question_count: number;
    ai_provider?: string;
    ai_model?: string | undefined;
    is_public: boolean;
}

interface QuestionsPayload {
    questions: QuestionPayload[];
}

export class QuizPersistenceService {
  static async saveGeneratedQuiz(
    quizData: QuizData,
    questionsPayload: QuestionsPayload,
    existingQuizId: string
  ): Promise<string> {
    const {
      user_id,
      title,
      description,
      source_type,
      source_data,
      difficulty,
      question_count,
      ai_provider = 'openrouter',
      ai_model,
      is_public,
    } = quizData;
    const { questions } = questionsPayload;

    console.log({ userId: user_id, quizTitle: title, existingQuizId }, 'Starting database transaction to update existing quiz.');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Update the existing quiz record instead of creating a new one
      const quizUpdateResult = await client.query(
        `UPDATE quizzes
         SET title = $1, description = $2, source_type = $3, source_data = $4, difficulty = $5, question_count = $6, ai_provider = $7, ai_model = $8, is_public = $9
         WHERE id = $10
         RETURNING id`,
        [title, description, source_type, source_data, difficulty, question_count, ai_provider, ai_model, is_public, existingQuizId]
      );

      if (quizUpdateResult.rows.length === 0) {
        throw new Error(`Quiz with ID ${existingQuizId} not found`);
      }

      const quizId = quizUpdateResult.rows[0].id;

      // Add questions and options
      for (const question of questions) {
        const questionInsertResult = await client.query(
          `INSERT INTO questions (quiz_id, question, source_quote, explanation)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [quizId, question.question_text, question.source_quote, question.explanation]
        );
        const questionId = questionInsertResult.rows[0].id;

        // Insert the options
        for (const option of question.options) {
          await client.query(
            `INSERT INTO question_options (question_id, option_text, is_correct)
             VALUES ($1, $2, $3)`,
            [questionId, option.option_text, option.is_correct]
          );
        }
      }

      await client.query('COMMIT');
      console.log({ userId: user_id, quizId }, 'Quiz updated and questions added successfully.');

      return quizId;

    } catch (error) {
      await client.query('ROLLBACK');
      // Re-throw the error to be handled by the controller
      throw error;
    } finally {
      client.release();
    }
  }
}
