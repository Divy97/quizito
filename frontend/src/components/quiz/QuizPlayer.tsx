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
  const [localResults, setLocalResults] = useState<QuestionResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);

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

  const handleOptionSelect = async (questionId: string, optionId: string) => {
    if (answerStatus || isValidating) return;

    setIsValidating(true);
    const newAnswers = { ...selectedAnswers, [questionId]: optionId };
    setSelectedAnswers(newAnswers);

    try {
      // Call the validation endpoint
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/${quizData.id}/validate-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          selectedOptionId: optionId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to validate answer');
      }

      const validationResult = await response.json();
      const isCorrect = validationResult.data.isCorrect;
      
      setAnswerStatus(isCorrect ? 'correct' : 'incorrect');

      // Store the result locally
      const questionResult: QuestionResult = {
        questionId,
        selectedOptionId: optionId,
        correctOptionId: '', // We don't know the correct answer
        isCorrect,
        explanation: validationResult.data.explanation
      };

      setLocalResults(prev => [...prev, questionResult]);

      setTimeout(() => {
        if (currentQuestionIndex < totalQuestions - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          handleFinishQuiz(newAnswers);
        }
      }, 1500);

    } catch (error) {
      console.error('Error validating answer:', error);
      setAnswerStatus('incorrect');
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    setAnswerStatus(null);
  }, [currentQuestionIndex]);

  const handleFinishQuiz = async (finalAnswers: Record<string, string>) => {
    setQuizState('submitting');
    const timeTaken = Math.round((Date.now() - startTime) / 1000);

    // Calculate score from local results
    const correctAnswers = localResults.filter(result => result.isCorrect).length;
    const finalScore = (correctAnswers / totalQuestions) * 100;

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
      
      // Use server results as they contain complete data including explanations for all questions
      const finalResults: QuizResultsType = {
        ...resultsData.data,
        correctAnswers,
        score: finalScore
      };
      
      setResults(finalResults);
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
    <div className="flex flex-col items-center justify-center p-4 md:p-6 min-h-[calc(100vh-120px)] relative z-10">
      {/* Progress Bar - Fixed at top */}
      <div className="w-full max-w-4xl mb-3 md:mb-4">
          <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-xl md:rounded-2xl p-2 md:p-3 shadow-xl shadow-[var(--quizito-electric-blue)]/5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
              <h1 className="text-base md:text-lg font-bold text-[var(--quizito-text-primary)] text-center sm:text-left">
                {quizData.title}
              </h1>
              <div className="text-xs md:text-sm text-[var(--quizito-text-muted)] text-center sm:text-right">
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
          className="w-full max-w-4xl bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-xl md:rounded-2xl shadow-2xl shadow-[var(--quizito-electric-blue)]/10"
        >

          {/* Question Content */}
          <div className="p-3 md:p-4 lg:p-6">
            {/* Loading Status Message */}
            {isValidating && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 md:mb-4 p-2 md:p-3 bg-[var(--quizito-electric-blue)]/10 border border-[var(--quizito-electric-blue)]/20 rounded-lg md:rounded-xl text-center"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-2 border-[var(--quizito-electric-blue)] border-t-transparent"></div>
                  <span className="text-[var(--quizito-electric-blue)] font-medium text-xs md:text-sm">
                    Checking your answer...
                  </span>
                </div>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-4 md:space-y-6">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-[var(--quizito-electric-blue)]/10 text-[var(--quizito-electric-blue)] px-2 md:px-3 py-1 md:py-2 rounded-full font-medium mb-3 md:mb-4">
                      <Brain className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="text-xs md:text-sm">Question {currentQuestionIndex + 1}</span>
                    </div>
                    <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-[var(--quizito-text-primary)] leading-relaxed px-2 text-justify">
                      {currentQuestion.question}
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 md:gap-3">
                    {currentQuestion.options.map((option) => {
                      const isSelected = selectedAnswers[currentQuestion.id] === option.id;

                      let buttonClass = "bg-[var(--quizito-glass-surface)] border-[var(--quizito-glass-border)] text-[var(--quizito-text-primary)] hover:border-[var(--quizito-electric-blue)]/50 hover:bg-[var(--quizito-glass-surface-hover)]";
                      
                      if (answerStatus === 'correct' && isSelected) {
                        buttonClass = "bg-[var(--quizito-cyber-green)]/20 border-[var(--quizito-cyber-green)] text-[var(--quizito-cyber-green)] shadow-[0_0_20px_rgba(0,255,136,0.3)]";
                      } else if (answerStatus === 'incorrect' && isSelected) {
                        buttonClass = "bg-[var(--quizito-hot-pink)]/20 border-[var(--quizito-hot-pink)] text-[var(--quizito-hot-pink)] shadow-[0_0_20px_rgba(255,0,110,0.3)]";
                      } else if (answerStatus) {
                        buttonClass += " opacity-50";
                      }

                      // Add loading state styling
                      if (isValidating && isSelected) {
                        buttonClass = "bg-[var(--quizito-electric-blue)]/20 border-[var(--quizito-electric-blue)] text-[var(--quizito-electric-blue)] shadow-[0_0_20px_rgba(0,212,255,0.3)]";
                      } else if (isValidating) {
                        buttonClass += " opacity-30 cursor-not-allowed";
                      }

                      return (
                        <motion.button
                          key={option.id}
                          onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
                          disabled={!!answerStatus || isValidating}
                          whileHover={{ scale: (answerStatus || isValidating) ? 1 : 1.02, y: (answerStatus || isValidating) ? 0 : -2 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full p-3 md:p-4 text-left text-sm md:text-base backdrop-blur-xl rounded-lg md:rounded-xl border transition-all duration-300 relative overflow-hidden ${buttonClass}`}
                        >                        
                          <div className="flex items-center gap-2 md:gap-3">
                            {answerStatus === 'correct' && isSelected && (
                              <Check className="h-4 w-4 md:h-5 md:w-5 text-[var(--quizito-cyber-green)] flex-shrink-0" />
                            )}
                            {answerStatus === 'incorrect' && isSelected && (
                              <X className="h-4 w-4 md:h-5 md:w-5 text-[var(--quizito-hot-pink)] flex-shrink-0" />
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
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)] p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl shadow-[var(--quizito-electric-blue)]/10"
        >
          <div className="text-center mb-6 md:mb-8">
            <div className="bg-gradient-to-r from-[var(--quizito-electric-blue)]/20 to-[var(--quizito-neon-purple)]/20 rounded-full p-3 md:p-4 w-fit mx-auto mb-4 md:mb-6">
              <User className="h-6 w-6 md:h-8 md:w-8 text-[var(--quizito-electric-blue)]" />
            </div>
            <h1 className="text-lg md:text-xl font-bold text-[var(--quizito-text-primary)] mb-2 md:mb-3">
              Ready for: <span className="text-[var(--quizito-electric-blue)]">{quizTitle}</span>
            </h1>
            <p className="text-sm md:text-base text-[var(--quizito-text-secondary)] leading-relaxed">
              Enter a nickname to appear on the leaderboard and start the quiz.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div>
              <Label htmlFor="nickname" className="text-[var(--quizito-text-primary)] font-semibold text-sm md:text-base">
                Your Nickname
              </Label>
              <Input
                id="nickname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g., Captain Quiz"
                className="mt-2 bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] text-[var(--quizito-text-primary)] placeholder:text-[var(--quizito-text-muted)] focus:border-[var(--quizito-electric-blue)] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)] focus:outline-none transition-all duration-300 h-10 md:h-12"
                required
                maxLength={30}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-neon-purple)] text-white font-semibold px-6 md:px-8 py-3 md:py-4 rounded-lg md:rounded-xl shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] hover:scale-105 transition-all duration-300"
            >
              <Play className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base">Start Quiz</span>
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
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(results.leaderboard);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshLeaderboard = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/${quizData.id}`, {
        method: 'GET',
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.data.leaderboard || []);
      }
    } catch (error) {
      console.error('Error refreshing leaderboard:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-6 min-h-[calc(100vh-120px)] relative z-10">
      <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5 }} 
          className="w-full max-w-5xl space-y-6 md:space-y-8"
        >
          {/* Score Header */}
          <div className="w-full max-w-4xl mb-6 md:mb-8 text-center">
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              transition={{ delay: 0.2, type: 'spring' }}
              className="mb-4 md:mb-6"
            >
              <div className={`w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full flex items-center justify-center text-3xl md:text-5xl font-bold text-white relative ${results.score >= 70 ? 'bg-gradient-to-r from-[var(--quizito-cyber-green)] to-[var(--quizito-electric-blue)]' : 'bg-gradient-to-r from-[var(--quizito-hot-pink)] to-[var(--quizito-electric-yellow)]'} shadow-2xl shadow-[var(--quizito-electric-blue)]/20`}>
                {Math.round(results.score)}%
                {results.score >= 70 && (
                  <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3">
                    <Trophy className="h-6 w-6 md:h-10 md:w-10 text-[var(--quizito-electric-yellow)]" />
                  </div>
                )}
              </div>
            </motion.div>
            <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-[var(--quizito-text-primary)] mb-2 md:mb-3">
              Quiz Complete!
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-[var(--quizito-text-secondary)] px-4">
              You answered <span className="text-[var(--quizito-electric-blue)] font-bold">{results.correctAnswers}</span> out of <span className="font-bold">{results.totalQuestions}</span> questions correctly.
            </p>
          </div>

          {/* Results Card */}
          <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-2xl md:rounded-3xl shadow-2xl shadow-[var(--quizito-electric-blue)]/10">
            <div className="p-4 md:p-6 lg:p-8">
              <h3 className="text-lg md:text-xl font-bold text-[var(--quizito-text-primary)] mb-3 md:mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-[var(--quizito-electric-blue)]" />
                Detailed Results
              </h3>
              <div className="space-y-3 md:space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {quizData.questions.map((question, index) => {
                  const result = results.results.find(r => r.questionId === question.id);
                  
                  // Debug logging
                  console.log(`Question ${index + 1}:`, {
                    questionId: question.id,
                    hasResult: !!result,
                    result: result
                  });
                  
                  return (
                    <motion.div 
                      key={question.id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-br from-[var(--quizito-glass-surface)] to-transparent backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-lg md:rounded-xl p-3 md:p-4 hover:border-[var(--quizito-electric-blue)]/30 transition-all duration-300"
                    >
                      {/* Question Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-3">
                        <div className="flex items-start gap-2 md:gap-3">
                          <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 md:mt-0 ${
                            result?.isCorrect 
                              ? 'bg-[var(--quizito-cyber-green)]/20 text-[var(--quizito-cyber-green)] border border-[var(--quizito-cyber-green)]/30' 
                              : result
                              ? 'bg-[var(--quizito-hot-pink)]/20 text-[var(--quizito-hot-pink)] border border-[var(--quizito-hot-pink)]/30'
                              : 'bg-[var(--quizito-text-muted)]/20 text-[var(--quizito-text-muted)] border border-[var(--quizito-text-muted)]/30'
                          }`}>
                            {index + 1}
                          </div>
                          <h4 className="font-semibold text-[var(--quizito-text-primary)] text-sm md:text-base leading-relaxed">
                            {question.question}
                          </h4>
                        </div>
                        {result && (
                          <div className={`flex items-center gap-2 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${
                            result.isCorrect 
                              ? 'bg-[var(--quizito-cyber-green)]/20 text-[var(--quizito-cyber-green)] border border-[var(--quizito-cyber-green)]/30' 
                              : 'bg-[var(--quizito-hot-pink)]/20 text-[var(--quizito-hot-pink)] border border-[var(--quizito-hot-pink)]/30'
                          }`}>
                            {result.isCorrect ? (
                              <>
                                <Check className="h-3 w-3 md:h-4 md:w-4" />
                                <span className="hidden sm:inline">Correct</span>
                                <span className="sm:hidden">✓</span>
                              </>
                            ) : (
                              <>
                                <X className="h-3 w-3 md:h-4 md:w-4" />
                                <span className="hidden sm:inline">Incorrect</span>
                                <span className="sm:hidden">✗</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Options */}
                      <div className="space-y-2 mb-3">
                        {question.options.map(option => {
                          const isSelected = result?.selectedOptionId === option.id;
                          const isCorrect = result?.correctOptionId === option.id;
                          
                          let optionClass = 'bg-[var(--quizito-glass-surface)] border-[var(--quizito-glass-border)] text-[var(--quizito-text-secondary)]';
                          let iconClass = 'text-[var(--quizito-text-muted)]';
                          
                          if (isCorrect) {
                            optionClass = 'bg-[var(--quizito-cyber-green)]/20 border-[var(--quizito-cyber-green)] text-[var(--quizito-cyber-green)] shadow-[0_0_10px_rgba(0,255,136,0.2)]';
                            iconClass = 'text-[var(--quizito-cyber-green)]';
                          } else if (isSelected && !isCorrect) {
                            optionClass = 'bg-[var(--quizito-hot-pink)]/20 border-[var(--quizito-hot-pink)] text-[var(--quizito-hot-pink)] shadow-[0_0_10px_rgba(255,0,110,0.2)]';
                            iconClass = 'text-[var(--quizito-hot-pink)]';
                          }

                          return (
                            <motion.div 
                              key={option.id} 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 + 0.1 }}
                              className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg border backdrop-blur-xl transition-all duration-300 ${optionClass}`}
                            >
                              <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center flex-shrink-0 ${iconClass}`}>
                                {isCorrect ? (
                                  <Check className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                ) : isSelected ? (
                                  <X className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                ) : (
                                  <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-current opacity-50" />
                                )}
                              </div>
                              <span className="leading-relaxed font-medium text-xs md:text-sm">
                                {option.option_text}
                              </span>
                              {isSelected && (
                                <div className="ml-auto text-xs font-medium opacity-70 hidden sm:block">
                                  Your Answer
                                </div>
                              )}
                              {isCorrect && !isSelected && (
                                <div className="ml-auto text-xs font-medium opacity-70 hidden sm:block">
                                  Correct Answer
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {result?.explanation && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 + 0.2 }}
                          className="mt-3 p-2 md:p-3 rounded-lg bg-gradient-to-r from-[var(--quizito-electric-blue)]/10 to-[var(--quizito-neon-purple)]/10 border border-[var(--quizito-electric-blue)]/20"
                        >
                          <div className="flex items-start gap-2">
                            <Brain className="h-3 w-3 md:h-4 md:w-4 text-[var(--quizito-electric-blue)] flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-[var(--quizito-text-primary)] mb-1 text-xs md:text-sm">
                                Explanation
                              </p>
                              <p className="text-[var(--quizito-text-secondary)] leading-relaxed text-xs md:text-sm">
                                {result.explanation}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 mt-6 md:mt-8">
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] text-[var(--quizito-text-primary)] hover:border-[var(--quizito-electric-blue)]/50 hover:bg-[var(--quizito-glass-surface-hover)] px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl"
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> 
                  <span className="text-sm md:text-base">Retake Quiz</span>
                </Button>
                <Button 
                  onClick={() => router.push('/my-quizzes')}
                  className="bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-neon-purple)] text-white font-semibold px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] hover:scale-105 transition-all duration-300"
                >
                  <BarChart className="mr-2 h-4 w-4" /> 
                  <span className="text-sm md:text-base">View My Quizzes</span>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Leaderboard Card */}
          {isPublicQuiz && (
            <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-2xl md:rounded-3xl shadow-2xl shadow-[var(--quizito-electric-blue)]/5">
              <div className="p-4 md:p-6 lg:p-8 border-b border-[var(--quizito-glass-border)]">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-[var(--quizito-text-primary)] flex items-center gap-2 md:gap-3">
                      <Trophy className="h-5 w-5 md:h-6 md:w-6 text-[var(--quizito-electric-yellow)]" />
                      Leaderboard
                    </h2>
                    <p className="text-sm md:text-base text-[var(--quizito-text-secondary)] mt-2">
                      See how you rank against other players
                    </p>
                  </div>
                  <Button
                    onClick={handleRefreshLeaderboard}
                    disabled={isRefreshing}
                    className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] text-[var(--quizito-text-primary)] hover:border-[var(--quizito-electric-blue)]/50 hover:bg-[var(--quizito-glass-surface-hover)] transition-all duration-300 px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span className="text-sm md:text-base">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                  </Button>
                </div>
              </div>
              <div className="p-4 md:p-6 lg:p-8">
                {leaderboard.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-[var(--quizito-glass-border)]">
                          <TableHead className="w-[50px] md:w-[60px] text-center text-[var(--quizito-text-primary)] text-sm md:text-base">Rank</TableHead>
                          <TableHead className="text-[var(--quizito-text-primary)] text-sm md:text-base">Nickname</TableHead>
                          <TableHead className="text-right text-[var(--quizito-text-primary)] text-sm md:text-base">Score</TableHead>
                          <TableHead className="text-right text-[var(--quizito-text-primary)] text-sm md:text-base">Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leaderboard.map((entry, index) => {
                          const isCurrentUser = entry.nickname === nickname;
                          return (
                            <TableRow key={index} className={`border-b-0 ${isCurrentUser ? 'bg-[var(--quizito-electric-blue)]/10' : ''}`}>
                              <TableCell className="text-center font-bold text-base md:text-lg">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                              </TableCell>
                              <TableCell className={`font-medium text-sm md:text-base ${isCurrentUser ? 'text-[var(--quizito-electric-blue)]' : 'text-[var(--quizito-text-primary)]'}`}>
                                {entry.nickname}
                              </TableCell>
                              <TableCell className="text-right font-semibold text-[var(--quizito-cyber-green)] text-sm md:text-base">
                                {Math.round(entry.score)}%
                              </TableCell>
                              <TableCell className="text-right text-[var(--quizito-text-muted)] text-sm md:text-base">
                                {entry.time_taken_seconds}s
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-6 md:py-8">
                    <Trophy className="h-8 w-8 md:h-12 md:w-12 text-[var(--quizito-electric-blue)] mx-auto mb-3 md:mb-4" />
                    <p className="text-sm md:text-base text-[var(--quizito-text-secondary)]">
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