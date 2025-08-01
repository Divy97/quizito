"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { MyQuiz } from '@/app/my-quizzes/page';
import { Button } from '@/components/ui/button';
import { FileText, Play, Trash2, HelpCircle, ChevronsUpDown, BarChart2, Zap } from 'lucide-react';
import { toast } from "sonner";
import { fetchWithAuth } from '@/lib/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface QuizListProps {
  quizzes: MyQuiz[];
}

export function QuizList({ quizzes: initialQuizzes }: QuizListProps) {
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteQuiz = async (quizId: string) => {
    setIsDeleting(true);
    toast.loading('Deleting quiz...');
    try {
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/${quizId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete quiz');
      }

      setQuizzes((prev) => prev.filter((quiz) => quiz.id !== quizId));
      setIsDeleting(false);
      toast.dismiss();
      toast.success('Quiz deleted successfully!');
    } catch (error) {
      toast.dismiss();
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-gradient-to-r from-[var(--quizito-electric-blue)]/20 to-[var(--quizito-neon-purple)]/20 rounded-full p-6 w-fit mx-auto mb-6">
          <FileText className="h-16 w-16 text-[var(--quizito-electric-blue)] mx-auto" />
        </div>
        <h2 className="text-3xl font-bold text-[var(--quizito-text-primary)] mb-4">No Quizzes Yet</h2>
        <p className="text-[var(--quizito-text-secondary)] text-lg mb-8 leading-relaxed">
          You haven&apos;t created any quizzes. Let&apos;s change that!
        </p>
        <Button asChild className="bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-neon-purple)] text-white font-semibold px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] hover:scale-105 transition-all duration-300">
          <Link href="/create">
            <Zap className="mr-2 h-5 w-5" />
            Create Your First Quiz
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quizzes.map((quiz) => (
        <motion.div
          key={quiz.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ y: -5 }}
        >
          <div className="h-full flex flex-col bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-2xl shadow-xl shadow-[var(--quizito-electric-blue)]/5 hover:shadow-[var(--quizito-electric-blue)]/10 hover:border-[var(--quizito-electric-blue)]/50 transition-all duration-300">
            {/* Card Header */}
            <div className="p-6 border-b border-[var(--quizito-glass-border)]">
              <h3 className="text-xl font-bold text-[var(--quizito-text-primary)] mb-2 line-clamp-2">
                {quiz.title}
              </h3>
              <p className="text-sm text-[var(--quizito-text-muted)]">
                Created {formatDistanceToNow(new Date(quiz.created_at!), { addSuffix: true })}
              </p>
            </div>

            {/* Card Content */}
            <div className="p-6 flex-grow">
              <div className="flex items-center gap-2 text-[var(--quizito-text-secondary)] mb-4">
                <HelpCircle className="h-4 w-4 text-[var(--quizito-electric-blue)]" />
                <span className="font-medium">{quiz.question_count} Questions</span>
              </div>

              {/* Quiz Attempts - Different display for public vs private quizzes */}
              {quiz.is_public ? (
                // For public quizzes, show total attempts count
                <div className="flex items-center gap-2 text-[var(--quizito-text-secondary)] mb-4">
                  <BarChart2 className="h-4 w-4 text-[var(--quizito-neon-purple)]" />
                  <span className="font-medium">
                    {quiz.total_attempts || 0} people took this quiz
                  </span>
                </div>
              ) : (
                // For private quizzes, show individual attempts
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-between text-[var(--quizito-text-secondary)] hover:text-[var(--quizito-electric-blue)] hover:bg-[var(--quizito-electric-blue)]/10 transition-all duration-200"
                    >
                      <div className="flex items-center gap-2">
                        <BarChart2 className="h-4 w-4" />
                        <span>Attempts ({quiz.quiz_attempts.length})</span>
                      </div>
                      <ChevronsUpDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 space-y-2">
                    {quiz.quiz_attempts.length > 0 ? (
                      quiz.quiz_attempts.map((attempt) => (
                        <div 
                          key={attempt.id} 
                          className="flex justify-between items-center p-3 rounded-xl bg-[var(--quizito-glass-surface)] border border-[var(--quizito-glass-border)]"
                        >
                          <span className="font-semibold text-[var(--quizito-cyber-green)]">
                            {attempt.score}%
                          </span>
                          <span className="text-[var(--quizito-text-muted)] text-sm">
                            {formatDistanceToNow(new Date(attempt.submitted_at!), { addSuffix: true })}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-[var(--quizito-text-muted)] text-sm">
                          No attempts yet
                        </p>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>

            {/* Card Footer */}
            <div className="flex items-center justify-between p-6 border-t border-[var(--quizito-glass-border)]">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    size="sm" 
                    className="bg-[var(--quizito-hot-pink)]/20 text-[var(--quizito-hot-pink)] border border-[var(--quizito-hot-pink)]/30 hover:bg-[var(--quizito-hot-pink)]/30 hover:border-[var(--quizito-hot-pink)] transition-all duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)]">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-[var(--quizito-text-primary)]">
                      Are you sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-[var(--quizito-text-secondary)]">
                      This action cannot be undone. This will permanently delete this quiz
                      and all of its associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-[var(--quizito-glass-surface)] text-[var(--quizito-text-primary)] border-[var(--quizito-glass-border)] hover:bg-[var(--quizito-glass-surface-hover)]">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDeleteQuiz(quiz.id)} 
                      disabled={isDeleting}
                      className="bg-[var(--quizito-hot-pink)] text-white hover:bg-[var(--quizito-hot-pink-hover)]"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {quiz.is_public ? (
                // For public quizzes, show "See Results" button
                <Button asChild size="sm" className="bg-gradient-to-r from-[var(--quizito-neon-purple)] to-[var(--quizito-cyber-green)] text-white font-semibold px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:shadow-[0_0_20px_rgba(139,92,246,0.6)] hover:scale-105 transition-all duration-300">
                  <Link href={`/quiz/${quiz.id}`}>
                    <BarChart2 className="h-4 w-4 mr-2" />
                    See Results
                  </Link>
                </Button>
              ) : (
                // For private quizzes, show "Start Quiz" button
                <Button asChild size="sm" className="bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-neon-purple)] text-white font-semibold px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(0,212,255,0.4)] hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] hover:scale-105 transition-all duration-300">
                  <Link href={`/quiz/${quiz.id}`}>
                    <Play className="h-4 w-4 mr-2" />
                    Start Quiz
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
} 