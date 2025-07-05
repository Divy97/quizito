"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { AppLayout } from '@/components/ui/app-layout';
import { PageTitle, BodyText } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Lock, Loader2 } from 'lucide-react';
import { QuizList } from '@/components/quiz/QuizList';
import { useRouter } from 'next/navigation';

export type MyQuiz = {
  id: string;
  title: string;
  description: string | null;
  question_count: number;
  created_at: string;
  quiz_attempts: Array<{
    id: string;
    score: number;
    submitted_at: string;
  }>;
};

export default function MyQuizzesPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<MyQuiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading) {
      return; // Wait until user object is resolved
    }
    if (!user) {
      // If user is not logged in after check, redirect to login
      router.push('/login');
      return;
    }

    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/my-quizzes`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch quizzes');
        }
        const data = await response.json();
        setQuizzes(data);
      } catch (error) {
        console.error('Error fetching user quizzes:', error);
      } finally {
        setLoading(false);
}
    };

    fetchQuizzes();
  }, [user, userLoading, router]);

  if (userLoading || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        </div>
      </AppLayout>
    );
  }

  // This part will only be rendered if the user is not loaded and not present
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

  return (
    <AppLayout>
      <div className="w-full max-w-5xl mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <PageTitle>My Quizzes</PageTitle>
          <BodyText className="text-gray-400">Here are all the quizzes you have created.</BodyText>
        </header>
        <QuizList quizzes={quizzes} />
      </div>
    </AppLayout>
  );
} 