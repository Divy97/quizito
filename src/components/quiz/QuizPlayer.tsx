"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ClientQuestion } from '@/app/quiz/[quizId]/page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PageTitle, BodyText } from '@/components/ui/typography';
import { AppLayout } from '../ui/app-layout';
import { Check, X, RefreshCw, BarChart } from 'lucide-react';
import { useRouter } from 'next/navigation';

type ClientQuizData = {
  id: string;
  title: string | null;
  description: string | null;
  questions: ClientQuestion[];
};

interface QuizPlayerProps {
  quizData: ClientQuizData;
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
};

export function QuizPlayer({ quizData }: QuizPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizState, setQuizState] = useState<'playing' | 'submitting' | 'finished'>('playing');
  const [results, setResults] = useState<QuizResultsType | null>(null);
  const [startTime] = useState(Date.now());
  const [answerStatus, setAnswerStatus] = useState<'correct' | 'incorrect' | null>(null);

  const totalQuestions = quizData.questions.length;
  const currentQuestion = quizData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / totalQuestions) * 100;

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
      const response = await fetch('/api/quizzes/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: quizData.id,
          answers: finalAnswers,
          timeTaken,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit quiz.');

      const resultsData = await response.json();
      setResults(resultsData);
      setQuizState('finished');
    } catch (error) {
      console.error(error);
      setQuizState('playing'); // Revert on error
    }
  };

  if (quizState === 'finished' && results) {
    return <QuizResults quizData={quizData} results={results} />;
  }

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center p-4 min-h-[calc(100vh-120px)]">
        <Card className="w-full max-w-3xl bg-[#1E1E1E]/95 border-[#2A2A2A] shadow-2xl shadow-purple-500/10 backdrop-blur-sm">
          <CardHeader className="text-center">
            <PageTitle>{quizData.title}</PageTitle>
            {quizData.description && <BodyText>{quizData.description}</BodyText>}
            <Progress value={progress} className="w-full mt-4 bg-[#2A2A2A] [&>*]:bg-gradient-to-r [&>*]:from-[#6366F1] [&>*]:to-[#14B8A6]" />
            <p className="text-sm text-gray-400 mt-2">Question {currentQuestionIndex + 1} of {totalQuestions}</p>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-center text-gray-100">{currentQuestion.question}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.question_options.map((option) => {
                      const isSelected = selectedAnswers[currentQuestion.id] === option.id;
                      const isCorrect = currentQuestion.correctOptionId === option.id;

                      let buttonClass = "border-[#3A3A3A] bg-[#2A2A2A]/50 hover:bg-[#3A3A3A]/70 text-[#E0E0E0] hover:text-white";
                      if (answerStatus && isCorrect) {
                        buttonClass = "bg-green-500/80 border-green-500 text-white";
                      } else if (answerStatus && isSelected && !isCorrect) {
                        buttonClass = "bg-red-500/80 border-red-500 text-white";
                      } else if (answerStatus) {
                        buttonClass += " opacity-50";
                      }

                      return (
                        <Button
                          key={option.id}
                          onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
                          disabled={!!answerStatus}
                          className={`w-full h-auto py-4 text-left justify-start text-base whitespace-normal transition-all duration-200 ${buttonClass}`}
                        >
                          {option.option_text}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function QuizResults({ quizData, results }: { quizData: ClientQuizData, results: QuizResultsType }) {
  const router = useRouter();

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center p-4 min-h-[calc(100vh-120px)]">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <Card className="w-full max-w-3xl bg-[#1E1E1E]/95 border-[#2A2A2A] shadow-2xl shadow-purple-500/10 backdrop-blur-sm">
            <CardHeader className="text-center items-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.2, type: 'spring' } }}>
                <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white ${results.score >= 70 ? 'bg-green-500' : 'bg-red-500'}`}>
                  {Math.round(results.score)}%
                </div>
              </motion.div>
              <PageTitle>Quiz Complete!</PageTitle>
              <BodyText>You answered {results.correctAnswers} out of {results.totalQuestions} questions correctly.</BodyText>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                {quizData.questions.map((question, index) => {
                  const result = results.results.find(r => r.questionId === question.id);
                  if (!result) return null;
                  
                  return (
                    <div key={question.id} className="p-4 rounded-lg bg-[#2A2A2A]/50 border border-[#3A3A3A]">
                      <h3 className="font-semibold text-gray-100 mb-2">Question {index + 1}: {question.question}</h3>
                      <div className="space-y-2">
                        {question.question_options.map(option => {
                          const isSelected = result.selectedOptionId === option.id;
                          const isCorrect = result.correctOptionId === option.id;
                          
                          let bgClass = 'bg-transparent';
                          if (isSelected && !isCorrect) bgClass = 'bg-red-500/30';
                          if (isCorrect) bgClass = 'bg-green-500/30';

                          return (
                            <div key={option.id} className={`flex items-center gap-3 p-2 rounded-md text-sm ${bgClass}`}>
                              {isCorrect ? <Check className="h-4 w-4 text-green-400" /> : (isSelected ? <X className="h-4 w-4 text-red-400" /> : <div className="w-4 h-4" />)}
                              <span className={isCorrect ? 'text-green-300' : (isSelected ? 'text-red-300' : 'text-gray-300')}>{option.option_text}</span>
                            </div>
                          );
                        })}
                      </div>
                      {!result.isCorrect && (
                        <div className="mt-3 p-3 rounded-md bg-[#121212] border border-[#2A2A2A] text-sm text-gray-400">
                          <p><span className="font-bold text-gray-200">Explanation:</span> {result.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center gap-4 mt-6">
                <Button variant="outline" onClick={() => window.location.reload()}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Retake Quiz
                </Button>
                <Button onClick={() => router.push('/my-quizzes')}>
                  <BarChart className="mr-2 h-4 w-4" /> View My Quizzes
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
} 