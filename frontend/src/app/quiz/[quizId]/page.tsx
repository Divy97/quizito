"use client";

import { notFound } from 'next/navigation';
import { AppLayout } from '@/components/ui/app-layout';
import { QuizPlayer } from '@/components/quiz/QuizPlayer';
import { PublicQuizDashboard } from '@/components/quiz/PublicQuizDashboard';
import { PageTitle, MutedText } from '@/components/ui/typography';
import { Lock } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

// Define the types that match our backend API response
type QuestionOption = {
  id: string;
  option_text: string;
};

export type ClientQuestion = {
  id: string;
  question: string;
  options: QuestionOption[];
};

type LeaderboardEntry = {
  nickname: string;
  score: number;
  time_taken_seconds: number;
};

type QuizPageResult = {
  id: string;
  title: string;
  description: string | null;
  questions: ClientQuestion[];
  is_public: boolean;
  isOwner: boolean;
  leaderboard: LeaderboardEntry[];
};

async function getQuizPageData(quizId: string): Promise<QuizPageResult | null | 'PROCESSING'> {
  try {
    const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/${quizId}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (response.status === 404) {
      return null;
    }
    if (response.status === 202) {
      return 'PROCESSING';
    }
    if (!response.ok) {
      // Log the error for server-side debugging
      console.error(`Failed to fetch quiz data for ID: ${quizId}, status: ${response.status}`);
      return null;
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error(`Exception while fetching quiz data for ID: ${quizId}`, error);
    return null;
  }
}

export default function QuizPage() {
  const params = useParams();
  const quizId = params.quizId as string;
  const [quizData, setQuizData] = useState<QuizPageResult | null | 'PROCESSING' | 'LOADING'>('LOADING');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const data = await getQuizPageData(quizId);
        setQuizData(data);
      } catch (err) {
        console.error('Error fetching quiz data:', err);
        setError('Failed to load quiz');
        setQuizData(null);
      }
    };

    if (quizId) {
      fetchQuizData();
    }
  }, [quizId]);

  // Loading state
  if (quizData === 'LOADING') {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center text-center p-4 min-h-[calc(100vh-120px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--quizito-electric-blue)] mb-4"></div>
          <PageTitle>Loading Quiz...</PageTitle>
          <MutedText>Please wait while we load your quiz.</MutedText>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error || quizData === null) {
    notFound();
  }

  if (quizData === 'PROCESSING') {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center text-center p-4 min-h-[calc(100vh-120px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--quizito-electric-blue)] mb-4"></div>
          <PageTitle>Quiz Still Being Generated</PageTitle>
          <MutedText>Your quiz is still being created. Please wait a moment and refresh the page.</MutedText>
        </div>
      </AppLayout>
    );
  }
  
  // Logic to show a simple "access denied" for non-owners of private quizzes
  // The API prevents data leakage, this is just a friendly UI.
  if (!quizData.is_public && !quizData.isOwner) {
    return (
       <AppLayout>
        <div className="flex flex-col items-center justify-center text-center p-4 min-h-[calc(100vh-120px)]">
          <Lock className="h-12 w-12 text-purple-400 mb-4" />
          <PageTitle>Private Quiz</PageTitle>
          <MutedText>This quiz is private and can only be viewed by its owner.</MutedText>
        </div>
      </AppLayout>
    )
  }

  // If the user is the owner of a public quiz, show them the dashboard.
  if (quizData.is_public && quizData.isOwner) {
    return <PublicQuizDashboard quizData={{...quizData, isPublic: quizData.is_public}} leaderboard={quizData.leaderboard} />;
  }

  // Otherwise, show the quiz player for them to take the quiz.
  return (
    <AppLayout>
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <QuizPlayer quizData={quizData} isOwner={quizData.isOwner} />
      </div>
    </AppLayout>
  );
} 