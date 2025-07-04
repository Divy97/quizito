import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type { LeaderboardEntry } from '@/lib/supabase/types';

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

    // 1. Fetch the quiz to check its visibility and ownership
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('is_public, user_id')
      .eq('id', quizId)
      .single();

    if (quizError || !quiz) {
      return NextResponse.json({ error: 'Quiz not found.' }, { status: 404 });
    }

    const isOwner = user?.id === quiz.user_id;

    // A non-owner cannot submit to a private quiz. This is a server-side check.
    if (!quiz.is_public && !isOwner) {
        return NextResponse.json({ error: 'You do not have permission to submit to this quiz.' }, { status: 403 });
    }

    // A nickname is required for public, non-owner submissions.
    if (quiz.is_public && !isOwner && !nickname) {
        return NextResponse.json({ error: 'Nickname is required for public quizzes.' }, { status: 400 });
    }

    // 2. Fetch questions with their correct options for the given quiz
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

    // 4. Determine nickname for the attempt
    let finalNickname: string;
    if (isOwner) {
      finalNickname = user?.email || 'Creator';
    } else {
      finalNickname = nickname!; // We've already validated it exists for this case
    }

    // 5. Save the attempt to the database
    const { error: attemptError } = await supabase.from('quiz_attempts').insert({
      quiz_id: quizId,
      user_id: user?.id, // Can be null for anonymous users
      nickname: finalNickname,
      score: (score / Object.keys(answers).length) * 100,
      time_taken_seconds: timeTaken,
    });
    
    if (attemptError) {
      console.error('Error saving quiz attempt:', attemptError);
      // We can still return results even if saving fails, so not returning an error response here.
    }

    // 6. Fetch leaderboard if the quiz is public
    let leaderboard: LeaderboardEntry[] = [];
    if (quiz.is_public) {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('nickname, score, time_taken_seconds')
        .eq('quiz_id', quizId)
        .order('score', { ascending: false })
        .order('time_taken_seconds', { ascending: true })
        .limit(10);
      
      if (error) {
        console.error("Failed to fetch leaderboard after submission:", error);
      } else if (data) {
        leaderboard = data;
      }
    }

    return NextResponse.json({
      totalQuestions: Object.keys(answers).length,
      correctAnswers: score,
      score: (score / Object.keys(answers).length) * 100,
      results,
      leaderboard,
    });

  } catch (error) {
    console.error('[QUIZ_SUBMIT_ERROR]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request payload', { status: 422 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
} 