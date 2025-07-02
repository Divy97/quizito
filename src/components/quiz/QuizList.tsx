"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { MyQuiz } from '@/app/my-quizzes/page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Play, Trash2, HelpCircle, ChevronsUpDown, BarChart2 } from 'lucide-react';
import { toast } from "sonner";
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
    
    // Keep a copy of the original quizzes in case we need to revert
    const originalQuizzes = [...quizzes];
    
    // Optimistically update the UI
    setQuizzes(prev => prev.filter(q => q.id !== quizId));

    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete quiz.');
      }

      toast.success("Quiz deleted successfully!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred.');
      }
      // Revert the UI on failure
      setQuizzes(originalQuizzes);
    } finally {
      setIsDeleting(false);
    }
  };

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText className="h-16 w-16 text-purple-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-white mb-2">No Quizzes Yet</h2>
        <p className="text-gray-400 mb-6">You haven&apos;t created any quizzes. Let&apos;s change that!</p>
        <Button asChild>
          <Link href="/create">Create Your First Quiz</Link>
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
        >
          <Card className="h-full flex flex-col bg-[#1E1E1E]/90 border-[#2A2A2A] hover:border-purple-500/50 transition-colors duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-100">{quiz.title}</CardTitle>
              <CardDescription className="text-sm text-gray-400">
                Created {formatDistanceToNow(new Date(quiz.created_at!), { addSuffix: true })}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex items-center text-sm text-gray-300">
                <HelpCircle className="h-4 w-4 mr-2 text-purple-400" />
                {quiz.question_count} Questions
              </div>
            </CardContent>

            <div className="px-6 pb-4">
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-gray-400 hover:text-white">
                    <BarChart2 className="h-4 w-4 mr-2" />
                    View Attempts ({quiz.quiz_attempts.length})
                    <ChevronsUpDown className="h-4 w-4 ml-auto" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="py-2 space-y-2">
                  {quiz.quiz_attempts.length > 0 ? (
                    quiz.quiz_attempts.map((attempt) => (
                      <div key={attempt.id} className="flex justify-between items-center text-sm p-2 rounded-md bg-[#2A2A2A]/50">
                        <span className="font-semibold text-white">{attempt.score}%</span>
                        <span className="text-gray-400">
                          {formatDistanceToNow(new Date(attempt.submitted_at!), { addSuffix: true })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-sm text-gray-500 py-2">No attempts yet.</p>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>

            <div className="flex items-center justify-end p-4 border-t border-[#2A2A2A]">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="mr-2">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this quiz
                      and all of its associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteQuiz(quiz.id)} disabled={isDeleting}>
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button asChild size="sm" className="bg-gradient-to-r from-[#6366F1] to-[#14B8A6]">
                <Link href={`/quiz/${quiz.id}`}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Quiz
                </Link>
              </Button>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
} 