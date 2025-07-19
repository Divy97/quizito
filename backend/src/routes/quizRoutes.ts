import { Router } from 'express';
import { deleteQuiz, generateQuiz, submitQuiz, getMyQuizzes, getQuizById } from '../controllers/quizController.js';
import { authenticateToken, softAuthenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// GET /quizzes/my-quizzes - Get all quizzes for the logged-in user
router.get('/my-quizzes', authenticateToken, getMyQuizzes);

// GET /quizzes/:quizId - Get a single quiz by its ID
router.get('/:quizId', softAuthenticateToken, getQuizById);

// POST /quizzes/generate - Generates a new quiz
router.post('/generate', authenticateToken, generateQuiz);

// POST /quizzes/submit - Submits a quiz for grading
router.post('/submit', softAuthenticateToken, submitQuiz);

// DELETE /quizzes/:quizId - Deletes a quiz
router.delete('/:quizId', authenticateToken, deleteQuiz);

export default router; 