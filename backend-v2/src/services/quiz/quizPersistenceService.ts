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
    is_public: boolean;
}

interface QuestionsPayload {
    questions: QuestionPayload[];
}

export class QuizPersistenceService {
  static async saveGeneratedQuiz(
    quizData: QuizData,
    questionsPayload: QuestionsPayload
  ): Promise<string> {
    const {
      user_id,
      title,
      description,
      source_type,
      source_data,
      difficulty,
      question_count,
      is_public,
    } = quizData;
    const { questions } = questionsPayload;

    console.log({ userId: user_id, quizTitle: title }, 'Starting database transaction to save quiz.');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Create the quiz
      const quizInsertResult = await client.query(
        `INSERT INTO quizzes (user_id, title, description, source_type, source_data, difficulty, question_count, is_public)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [user_id, title, description, source_type, source_data, difficulty, question_count, is_public]
      );
      const quizId = quizInsertResult.rows[0].id;

      // Add questions and options
      for (const question of questions) {
        const questionInsertResult = await client.query(
          `INSERT INTO questions (quiz_id, question, explanation)
           VALUES ($1, $2, $3)
           RETURNING id`,
          [quizId, question.question_text, question.explanation]
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
      console.log({ userId: user_id, quizId }, 'Quiz generated and saved successfully.');

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