import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { QuizPlayer } from '@/components/quiz/QuizPlayer';
import type { Tables, LeaderboardEntry } from '@/lib/supabase/types';
import { PublicQuizDashboard } from '@/components/quiz/PublicQuizDashboard';

type QuestionOption = Pick<Tables<'question_options'>, 'id' | 'option_text'>;

export type ClientQuestion = Pick<Tables<'questions'>, 'id' | 'question'> & {
  question_options: QuestionOption[];
  correctOptionId: string;
};

type ClientQuizData = Pick<Tables<'quizzes'>, 'id' | 'title' | 'description'> & {
  questions: ClientQuestion[];
  isPublic: boolean;
};

type QuizForPlayerResult = ClientQuizData & {
  isPublic: boolean;
  isOwner: boolean;
};

async function getLeaderboard(quizId: string): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('nickname, score, time_taken_seconds')
    .eq('quiz_id', quizId)
    .order('score', { ascending: false })
    .order('time_taken_seconds', { ascending: true })
    .limit(100);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
  return data;
}

async function getQuizForPlayer(quizId: string): Promise<QuizForPlayerResult | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: quizData, error } = await supabase
    .from('quizzes')
    .select(`
      id,
      title,
      description,
      is_public,
      user_id,
      questions (
        id,
        question,
        question_options (
          id,
          option_text,
          is_correct
        )
      )
    `)
    .eq('id', quizId)
    .single();

  if (error || !quizData) {
    return null;
  }

  const isOwner = user ? quizData.user_id === user.id : false;

  if (!quizData.is_public && !isOwner) {
    return null;
  }
  
  const clientQuestions: ClientQuestion[] = quizData.questions.map(q => {
    const correctOption = q.question_options.find(opt => opt.is_correct);
    return {
      id: q.id,
      question: q.question,
      question_options: q.question_options.map(({ id, option_text }) => ({ id, option_text })),
      correctOptionId: correctOption?.id || '',
    };
  });
  
  const validQuestions = clientQuestions.filter(q => q.correctOptionId);

  return {
    id: quizData.id,
    title: quizData.title,
    description: quizData.description,
    questions: validQuestions,
    isPublic: quizData.is_public,
    isOwner: isOwner,
  };
}


export default async function QuizPage({ params }: { params: { quizId: string } }) {
  const {quizId} = await params;
  const quizData = await getQuizForPlayer(quizId);

  if (!quizData) {
    notFound();
  }

  if (quizData.isPublic && quizData.isOwner) {
    const {quizId} = await params;
    const leaderboard = await getLeaderboard(quizId);
    return <PublicQuizDashboard quizData={quizData} leaderboard={leaderboard} />;
  }
  
  return <QuizPlayer quizData={quizData} isOwner={quizData.isOwner} />;
} 