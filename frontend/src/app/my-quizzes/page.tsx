import { AppLayout } from '@/components/ui/app-layout';
import { PageTitle, BodyText } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import type { Tables } from '@/lib/supabase/types';
import { QuizList } from '@/components/quiz/QuizList';

async function getMyQuizzes(userId: string) {
  // const { data, error } = await supabase
  //   .from('quizzes')
  //   .select(`
  //     id, 
  //     title, 
  //     description, 
  //     question_count, 
  //     created_at,
  //     quiz_attempts (
  //       id,
  //       score,
  //       submitted_at
  //     )
  //   `)
  //   .eq('user_id', userId)
  //   .eq('quiz_attempts.user_id', userId)
  //   .order('created_at', { ascending: false })
  //   .order('submitted_at', { referencedTable: 'quiz_attempts', ascending: false });

  // console.log(data);
  // if (error) {
  //   console.error('Error fetching user quizzes:', error);
  //   return [];
  // }
  return [];
}

export type MyQuiz = Pick<Tables<'quizzes'>, 'id' | 'title' | 'description' | 'question_count' | 'created_at'> & {
  quiz_attempts: Array<Pick<Tables<'quiz_attempts'>, 'id' | 'score' | 'submitted_at'>>;
};

export default async function MyQuizzesPage() {
  const user = null;

  if (!user) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center text-center p-4 min-h-[calc(100vh-120px)]">
          <Lock className="h-12 w-12 text-purple-400 mb-4" />
          <PageTitle>Access Denied</PageTitle>
          <BodyText className="mb-6">You must be logged in to view your quizzes.</BodyText>
          <Button asChild>
            <Link href="/login">Go to Login</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const quizzes = await getMyQuizzes('');

  return (
    <AppLayout>
      <div className="w-full max-w-5xl mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <PageTitle>My Quizzes</PageTitle>
          <BodyText className="text-gray-400">Here are all the quizzes you have created.</BodyText>
        </header>
        <QuizList quizzes={quizzes as MyQuiz[]} />
      </div>
    </AppLayout>
  );
} 