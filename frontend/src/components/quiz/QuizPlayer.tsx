"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClientQuestion } from '@/app/quiz/[quizId]/page';
import { Button } from '@/components/ui/button';
import { fetchWithAuth } from '@/lib/api';
import { Check, X, RefreshCw, BarChart, User, Play, Trophy, Sparkles, Brain } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from 'next/navigation';

type ClientQuizData = {
  id: string;
  title: string | null;
  description: string | null;
  questions: ClientQuestion[];
  is_public: boolean;
};

type LeaderboardEntry = {
  nickname: string;
  score: number;
  time_taken_seconds: number;
};

interface QuizPlayerProps {
  quizData: ClientQuizData;
  isOwner: boolean;
}

type QuestionResult = {
  questionId: string;
  selectedOptionId: string;
  correctOptionId: string;
  isCorrect: boolean;
  explanation: string | null;
};

type QuizResultsType = {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  results: QuestionResult[];
  leaderboard: LeaderboardEntry[];
};

export function QuizPlayer({ quizData, isOwner }: QuizPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizState, setQuizState] = useState<'pending' | 'playing' | 'submitting' | 'finished'>('pending');
  const [results, setResults] = useState<QuizResultsType | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [answerStatus, setAnswerStatus] = useState<'correct' | 'incorrect' | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);

  const totalQuestions = quizData.questions.length;
  const currentQuestion = quizData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / totalQuestions) * 100;

  const needsNickname = quizData.is_public && !isOwner;

  useEffect(() => {
    if (needsNickname) {
      setQuizState('pending');
    } else {
      setQuizState('playing');
      setStartTime(Date.now());
    }
  }, [needsNickname]);

  const handleStartQuiz = (name: string) => {
    setNickname(name);
    setQuizState('playing');
    setStartTime(Date.now());
  };

  const handleOptionSelect = (questionId: string, optionId: string) => {
    if (answerStatus) return;

    const isCorrect = optionId === currentQuestion.correctOptionId;
    setAnswerStatus(isCorrect ? 'correct' : 'incorrect');
    const newAnswers = { ...selectedAnswers, [questionId]: optionId };
    setSelectedAnswers(newAnswers);

    setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        handleFinishQuiz(newAnswers);
      }
    }, 1500);
  };

  useEffect(() => {
    setAnswerStatus(null);
  }, [currentQuestionIndex]);

  const handleFinishQuiz = async (finalAnswers: Record<string, string>) => {
    setQuizState('submitting');
    const timeTaken = Math.round((Date.now() - startTime) / 1000);

    try {
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: quizData.id,
          answers: finalAnswers,
          timeTaken,
          nickname: needsNickname ? nickname : null,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit quiz.');

      const resultsData = await response.json();
      setResults(resultsData);
      setQuizState('finished');
    } catch (error) {
      console.error(error);
      setQuizState('playing');
    }
  };

  if (quizState === 'pending' && needsNickname) {
    return <NicknameDialog onStart={handleStartQuiz} quizTitle={quizData.title} />;
  }

  if (quizState === 'finished' && results) {
    return <QuizResults quizData={quizData} results={results} nickname={nickname} />;
  }

  if (quizState === 'submitting') {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-2xl p-8 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-[var(--quizito-electric-blue)] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-[var(--quizito-text-primary)] font-medium">
              Calculating your results...
            </p>
          </div>
        </div>
      </>
    );
  }

  if (quizState !== 'playing' || !currentQuestion) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-[calc(100vh-120px)] relative z-10">
      {/* Progress Bar - Fixed at top */}
      <div className="w-full max-w-4xl mb-6">
          <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-2xl p-4 shadow-xl shadow-[var(--quizito-electric-blue)]/5">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-bold text-[var(--quizito-text-primary)]">
                {quizData.title}
              </h1>
              <div className="text-sm text-[var(--quizito-text-muted)]">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </div>
            </div>
            <div className="w-full bg-[var(--quizito-glass-surface)] rounded-full h-2 border border-[var(--quizito-glass-border)]">
              <motion.div
                className="h-full bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-neon-purple)] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-3xl shadow-2xl shadow-[var(--quizito-electric-blue)]/10"
        >

          {/* Question Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-8">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-[var(--quizito-electric-blue)]/10 text-[var(--quizito-electric-blue)] px-4 py-2 rounded-full font-medium mb-6">
                      <Brain className="h-4 w-4" />
                      Question {currentQuestionIndex + 1}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-[var(--quizito-text-primary)] leading-relaxed">
                      {currentQuestion.question}
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.options.map((option) => {
                      const isSelected = selectedAnswers[currentQuestion.id] === option.id;
                      const isCorrect = currentQuestion.correctOptionId === option.id;

                      let buttonClass = "bg-[var(--quizito-glass-surface)] border-[var(--quizito-glass-border)] text-[var(--quizito-text-primary)] hover:border-[var(--quizito-electric-blue)]/50 hover:bg-[var(--quizito-glass-surface-hover)]";
                      
                      if (answerStatus && isCorrect) {
                        buttonClass = "bg-[var(--quizito-cyber-green)]/20 border-[var(--quizito-cyber-green)] text-[var(--quizito-cyber-green)] shadow-[0_0_20px_rgba(0,255,136,0.3)]";
                      } else if (answerStatus && isSelected && !isCorrect) {
                        buttonClass = "bg-[var(--quizito-hot-pink)]/20 border-[var(--quizito-hot-pink)] text-[var(--quizito-hot-pink)] shadow-[0_0_20px_rgba(255,0,110,0.3)]";
                      } else if (answerStatus) {
                        buttonClass += " opacity-50";
                      }

                      return (
                        <motion.button
                          key={option.id}
                          onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
                          disabled={!!answerStatus}
                          whileHover={{ scale: answerStatus ? 1 : 1.02, y: answerStatus ? 0 : -2 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full p-6 text-left text-lg backdrop-blur-xl rounded-2xl border transition-all duration-300 relative overflow-hidden ${buttonClass}`}
                        >
                          <div className="flex items-center gap-4">
                            {answerStatus && isCorrect && (
                              <Check className="h-6 w-6 text-[var(--quizito-cyber-green)] flex-shrink-0" />
                            )}
                            {answerStatus && isSelected && !isCorrect && (
                              <X className="h-6 w-6 text-[var(--quizito-hot-pink)] flex-shrink-0" />
                            )}
                            <span className="leading-relaxed">{option.option_text}</span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
  );
}

function NicknameDialog({ onStart, quizTitle }: { onStart: (nickname: string) => void; quizTitle: string | null }) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onStart(name.trim());
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)] p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-3xl p-8 shadow-2xl shadow-[var(--quizito-electric-blue)]/10"
        >
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-[var(--quizito-electric-blue)]/20 to-[var(--quizito-neon-purple)]/20 rounded-full p-4 w-fit mx-auto mb-6">
              <User className="h-8 w-8 text-[var(--quizito-electric-blue)]" />
            </div>
            <h1 className="text-xl font-bold text-[var(--quizito-text-primary)] mb-3">
              Ready for: <span className="text-[var(--quizito-electric-blue)]">{quizTitle}</span>
            </h1>
            <p className="text-[var(--quizito-text-secondary)] leading-relaxed">
              Enter a nickname to appear on the leaderboard and start the quiz.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="nickname" className="text-[var(--quizito-text-primary)] font-semibold">
                Your Nickname
              </Label>
              <Input
                id="nickname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g., Captain Quiz"
                className="mt-2 bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] text-[var(--quizito-text-primary)] placeholder:text-[var(--quizito-text-muted)] focus:border-[var(--quizito-electric-blue)] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)] focus:outline-none transition-all duration-300 h-12"
                required
                maxLength={30}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-neon-purple)] text-white font-semibold px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] hover:scale-105 transition-all duration-300"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Quiz
            </Button>
          </form>
        </motion.div>
      </div>
  );
}

function QuizResults({
  quizData,
  results,
  nickname,
}: {
  quizData: ClientQuizData;
  results: QuizResultsType;
  nickname: string | null;
}) {
  const router = useRouter();
  const isPublicQuiz = quizData.is_public;

  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-[calc(100vh-120px)] relative z-10">
      <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5 }} 
          className="w-full max-w-5xl space-y-8"
        >
          {/* Score Header */}
          <div className="w-full max-w-4xl mb-8 text-center">
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              transition={{ delay: 0.2, type: 'spring' }}
              className="mb-6"
            >
              <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center text-5xl font-bold text-white relative ${results.score >= 70 ? 'bg-gradient-to-r from-[var(--quizito-cyber-green)] to-[var(--quizito-electric-blue)]' : 'bg-gradient-to-r from-[var(--quizito-hot-pink)] to-[var(--quizito-electric-yellow)]'} shadow-2xl shadow-[var(--quizito-electric-blue)]/20`}>
                {Math.round(results.score)}%
                {results.score >= 70 && (
                  <div className="absolute -top-3 -right-3">
                    <Trophy className="h-10 w-10 text-[var(--quizito-electric-yellow)]" />
                  </div>
                )}
              </div>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--quizito-text-primary)] mb-4">
              Quiz Complete!
            </h1>
            <p className="text-xl text-[var(--quizito-text-secondary)]">
              You answered <span className="text-[var(--quizito-electric-blue)] font-bold">{results.correctAnswers}</span> out of <span className="font-bold">{results.totalQuestions}</span> questions correctly.
            </p>
          </div>

          {/* Results Card */}
          <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-3xl shadow-2xl shadow-[var(--quizito-electric-blue)]/10">
            
            <div className="p-8">
              <h3 className="text-2xl font-bold text-[var(--quizito-text-primary)] mb-6 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-[var(--quizito-electric-blue)]" />
                Detailed Results
              </h3>
              <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
                {quizData.questions.map((question, index) => {
                  const result = results.results.find(r => r.questionId === question.id);
                  if (!result) return null;
                  
                  return (
                    <div key={question.id} className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-2xl p-6">
                      <h4 className="font-semibold text-[var(--quizito-text-primary)] mb-4 text-lg">
                        Question {index + 1}: {question.question}
                      </h4>
                      <div className="space-y-3">
                        {question.options.map(option => {
                          const isSelected = result.selectedOptionId === option.id;
                          const isCorrect = result.correctOptionId === option.id;
                          
                          let bgClass = 'bg-[var(--quizito-glass-surface)] border-[var(--quizito-glass-border)]';
                          if (isSelected && !isCorrect) bgClass = 'bg-[var(--quizito-hot-pink)]/20 border-[var(--quizito-hot-pink)]';
                          if (isCorrect) bgClass = 'bg-[var(--quizito-cyber-green)]/20 border-[var(--quizito-cyber-green)]';

                          return (
                            <div key={option.id} className={`flex items-center gap-3 p-4 rounded-xl border backdrop-blur-xl ${bgClass}`}>
                              {isCorrect ? (
                                <Check className="h-5 w-5 text-[var(--quizito-cyber-green)] flex-shrink-0" />
                              ) : isSelected ? (
                                <X className="h-5 w-5 text-[var(--quizito-hot-pink)] flex-shrink-0" />
                              ) : (
                                <div className="w-5 h-5 flex-shrink-0" />
                              )}
                              <span className={`${isCorrect ? 'text-[var(--quizito-cyber-green)]' : isSelected ? 'text-[var(--quizito-hot-pink)]' : 'text-[var(--quizito-text-secondary)]'} leading-relaxed`}>
                                {option.option_text}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      {!result.isCorrect && result.explanation && (
                        <div className="mt-4 p-4 rounded-xl bg-[var(--quizito-glass-surface)] border border-[var(--quizito-glass-border)]">
                          <p className="text-[var(--quizito-text-secondary)]">
                            <span className="font-bold text-[var(--quizito-text-primary)]">Explanation:</span> {result.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] text-[var(--quizito-text-primary)] hover:border-[var(--quizito-electric-blue)]/50 hover:bg-[var(--quizito-glass-surface-hover)]"
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> 
                  Retake Quiz
                </Button>
                <Button 
                  onClick={() => router.push('/my-quizzes')}
                  className="bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-neon-purple)] text-white font-semibold px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] hover:scale-105 transition-all duration-300"
                >
                  <BarChart className="mr-2 h-4 w-4" /> 
                  View My Quizzes
                </Button>
              </div>
            </div>
          </div>
          
          {/* Leaderboard Card */}
          {isPublicQuiz && (
            <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-3xl shadow-2xl shadow-[var(--quizito-electric-blue)]/5">
              <div className="p-8 border-b border-[var(--quizito-glass-border)]">
                <h2 className="text-2xl font-bold text-[var(--quizito-text-primary)] flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-[var(--quizito-electric-yellow)]" />
                  Leaderboard
                </h2>
                <p className="text-[var(--quizito-text-secondary)] mt-2">
                  See how you rank against other players
                </p>
              </div>
              <div className="p-8">
                {results.leaderboard.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-[var(--quizito-glass-border)]">
                          <TableHead className="w-[60px] text-center text-[var(--quizito-text-primary)]">Rank</TableHead>
                          <TableHead className="text-[var(--quizito-text-primary)]">Nickname</TableHead>
                          <TableHead className="text-right text-[var(--quizito-text-primary)]">Score</TableHead>
                          <TableHead className="text-right text-[var(--quizito-text-primary)]">Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.leaderboard.map((entry, index) => {
                          const isCurrentUser = entry.nickname === nickname;
                          return (
                            <TableRow key={index} className={`border-b-0 ${isCurrentUser ? 'bg-[var(--quizito-electric-blue)]/10' : ''}`}>
                              <TableCell className="text-center font-bold text-lg">
                                {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                              </TableCell>
                              <TableCell className={`font-medium ${isCurrentUser ? 'text-[var(--quizito-electric-blue)]' : 'text-[var(--quizito-text-primary)]'}`}>
                                {entry.nickname}
                              </TableCell>
                              <TableCell className="text-right font-semibold text-[var(--quizito-cyber-green)]">
                                {Math.round(entry.score)}%
                              </TableCell>
                              <TableCell className="text-right text-[var(--quizito-text-muted)]">
                                {entry.time_taken_seconds}s
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-[var(--quizito-electric-blue)] mx-auto mb-4" />
                    <p className="text-[var(--quizito-text-secondary)]">
                      You&apos;re the first to take this quiz! Your score is at the top of the leaderboard.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
  );
} 