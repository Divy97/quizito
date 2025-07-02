import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const submitQuizSchema = z.object({
  quizId: z.string().uuid(),
  answers: z.record(z.string().uuid(), z.string().uuid()),
  nickname: z.string().min(3).max(20).optional(),
  timeTaken: z.number().int().positive(),
});

type QuestionResult = {
  questionId: string;
  selectedOptionId: string;
  correctOptionId: string;
  isCorrect: boolean;
  explanation: string | null;
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const validation = submitQuizSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { quizId, answers, nickname, timeTaken } = validation.data;

    // 1. Fetch questions with their correct options for the given quiz
    const { data: questionsWithCorrectOptions, error: fetchError } = await supabase
      .from('questions')
      .select(`
        id,
        explanation,
        question_options!inner (
          id
        )
      `)
      .eq('quiz_id', quizId)
      .eq('question_options.is_correct', true)
      .in('id', Object.keys(answers));

    if (fetchError || !questionsWithCorrectOptions) {
      console.error('Error fetching correct answers:', fetchError);
      return NextResponse.json({ error: 'Could not retrieve quiz data for grading.' }, { status: 500 });
    }
    
    // 2. Grade the quiz
    let score = 0;
    const results: QuestionResult[] = [];
    const correctOptionsMap = new Map<string, { correctOptionId: string; explanation: string | null }>();
    
    for (const question of questionsWithCorrectOptions) {
      const correctOption = question.question_options[0]; // We know there's only one correct option
      if (correctOption) {
        correctOptionsMap.set(question.id, {
          correctOptionId: correctOption.id,
          explanation: question.explanation,
        });
      }
    }

    for (const questionId in answers) {
      const selectedOptionId = answers[questionId];
      const correctInfo = correctOptionsMap.get(questionId);
      
      if (correctInfo && selectedOptionId === correctInfo.correctOptionId) {
        score++;
      }
      
      results.push({
        questionId,
        selectedOptionId,
        correctOptionId: correctInfo?.correctOptionId || '',
        isCorrect: selectedOptionId === correctInfo?.correctOptionId,
        explanation: correctInfo?.explanation || 'No explanation available.',
      });
    }

    // 3. Save the attempt to the database
    const { error: attemptError } = await supabase.from('quiz_attempts').insert({
      quiz_id: quizId,
      user_id: user?.id,
      nickname: user?.email || nickname || 'Anonymous', // Use email, then nickname, then default
      score: (score / Object.keys(answers).length) * 100,
      time_taken_seconds: timeTaken,
    });
    
    if (attemptError) {
      console.error('Error saving quiz attempt:', attemptError);
      // We can still return results even if saving fails, so not returning an error response here.
    }

    return NextResponse.json({
      totalQuestions: Object.keys(answers).length,
      correctAnswers: score,
      score: (score / Object.keys(answers).length) * 100,
      results,
    });

  } catch (error) {
    console.error('[QUIZ_SUBMIT_ERROR]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request payload', { status: 422 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
} 