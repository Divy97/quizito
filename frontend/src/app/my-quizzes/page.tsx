"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { AppLayout } from '@/components/ui/app-layout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Lock, Loader2, Plus, Sparkles, Zap, Trophy, BarChart3 } from 'lucide-react';
import { QuizList } from '@/components/quiz/QuizList';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { fetchWithAuth } from '@/lib/api';

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

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
        const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/my-quizzes`);

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
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-[var(--quizito-electric-blue)] mx-auto" />
            <p className="text-[var(--quizito-text-secondary)]">Loading your quizzes...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // This part will only be rendered if the user is not loaded and not present
  if (!user) {
    return (
      <AppLayout>
        {/* Background Effects */}
        <div className="fixed inset-0 bg-gradient-to-br from-[var(--quizito-bg-primary)] via-[var(--quizito-bg-secondary)] to-[var(--quizito-bg-primary)] -z-10" />
        
        <div className="flex flex-col items-center justify-center text-center p-6 min-h-[calc(100vh-120px)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md space-y-8"
          >
            <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-full p-6 w-fit mx-auto">
              <Lock className="h-12 w-12 text-[var(--quizito-electric-blue)]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--quizito-text-primary)]">
              Access Denied
            </h1>
            <p className="text-xl text-[var(--quizito-text-secondary)] leading-relaxed">
              You must be logged in to view your quizzes.
              <br />
              <span className="text-[var(--quizito-electric-blue)] font-semibold">Please sign in to continue.</span>
            </p>
            <Button asChild className="bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-neon-purple)] text-white font-semibold px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] hover:scale-105 transition-all duration-300">
              <Link href="/login">Go to Login</Link>
            </Button>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  // Calculate stats
  const totalQuizzes = quizzes.length;
  const totalAttempts = quizzes.reduce((sum, quiz) => sum + quiz.quiz_attempts.length, 0);
  const averageScore = totalAttempts > 0 
    ? Math.round(quizzes.reduce((sum, quiz) => sum + quiz.quiz_attempts.reduce((scoreSum, attempt) => scoreSum + attempt.score, 0), 0) / totalAttempts)
    : 0;

  return (
    <AppLayout>
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-[var(--quizito-bg-primary)] via-[var(--quizito-bg-secondary)] to-[var(--quizito-bg-primary)] -z-10" />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-7xl mx-auto px-6 py-12 relative z-10"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[var(--quizito-neon-purple)]/10 text-[var(--quizito-neon-purple)] px-4 py-2 rounded-full font-medium mb-6">
            <Trophy className="h-4 w-4" />
            Your Quiz Dashboard
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-[var(--quizito-text-primary)] mb-6">
            My
            <span className="bg-gradient-to-r from-[var(--quizito-electric-blue)] via-[var(--quizito-neon-purple)] to-[var(--quizito-cyber-green)] bg-clip-text text-transparent"> Quizzes</span>
          </h1>
          <p className="text-xl text-[var(--quizito-text-secondary)] max-w-3xl mx-auto leading-relaxed">
            Manage all your AI-generated quizzes in one place. Track performance, share with others, and create new ones.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-2xl p-6 text-center hover:border-[var(--quizito-electric-blue)]/50 transition-all duration-300">
            <div className="bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-neon-purple)] rounded-full p-3 w-fit mx-auto mb-4">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-[var(--quizito-electric-blue)] mb-2">
              {totalQuizzes}
            </div>
            <div className="text-[var(--quizito-text-secondary)] font-medium">
              Total Quizzes
            </div>
          </div>

          <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-2xl p-6 text-center hover:border-[var(--quizito-cyber-green)]/50 transition-all duration-300">
            <div className="bg-gradient-to-r from-[var(--quizito-cyber-green)] to-[var(--quizito-electric-yellow)] rounded-full p-3 w-fit mx-auto mb-4">
              <BarChart3 className="h-6 w-6 text-black" />
            </div>
            <div className="text-3xl font-bold text-[var(--quizito-cyber-green)] mb-2">
              {totalAttempts}
            </div>
            <div className="text-[var(--quizito-text-secondary)] font-medium">
              Total Attempts
            </div>
          </div>

          <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-2xl p-6 text-center hover:border-[var(--quizito-neon-purple)]/50 transition-all duration-300">
            <div className="bg-gradient-to-r from-[var(--quizito-neon-purple)] to-[var(--quizito-hot-pink)] rounded-full p-3 w-fit mx-auto mb-4">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-[var(--quizito-neon-purple)] mb-2">
              {averageScore}%
            </div>
            <div className="text-[var(--quizito-text-secondary)] font-medium">
              Average Score
            </div>
          </div>
        </motion.div>

        {/* Action Bar */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[var(--quizito-text-primary)]">
              Your Quiz Collection
            </h2>
            <p className="text-[var(--quizito-text-secondary)]">
              {totalQuizzes > 0 ? `${totalQuizzes} quiz${totalQuizzes === 1 ? '' : 'es'} created` : 'No quizzes yet'}
            </p>
          </div>
          
          <Link href="/create">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-neon-purple)] text-white font-semibold px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] transition-all duration-300 flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Create New Quiz
            </motion.button>
          </Link>
        </motion.div>

        {/* Quiz List */}
        <motion.div variants={itemVariants}>
          {totalQuizzes > 0 ? (
            <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-3xl p-8 shadow-2xl shadow-[var(--quizito-electric-blue)]/5">
              <QuizList quizzes={quizzes} />
            </div>
          ) : (
            <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-3xl p-12 text-center shadow-2xl shadow-[var(--quizito-electric-blue)]/5">
              <div className="max-w-md mx-auto space-y-6">
                <div className="bg-gradient-to-r from-[var(--quizito-electric-blue)]/20 to-[var(--quizito-neon-purple)]/20 rounded-full p-6 w-fit mx-auto">
                  <Sparkles className="h-12 w-12 text-[var(--quizito-electric-blue)]" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--quizito-text-primary)]">
                  No Quizzes Yet
                </h3>
                <p className="text-[var(--quizito-text-secondary)] leading-relaxed">
                  Ready to create your first AI-powered quiz? Transform any content into engaging questions in seconds.
                </p>
                <Link href="/create">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-neon-purple)] text-white font-semibold px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] transition-all duration-300 flex items-center gap-2 mx-auto"
                  >
                    <Zap className="h-5 w-5" />
                    Create Your First Quiz
                  </motion.button>
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AppLayout>
  );
} 