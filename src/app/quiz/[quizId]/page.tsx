import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { QuizPlayer } from '@/components/quiz/QuizPlayer';
import type { Tables } from '@/lib/supabase/types';

type QuestionOption = Pick<Tables<'question_options'>, 'id' | 'option_text'>;

export type ClientQuestion = Pick<Tables<'questions'>, 'id' | 'question'> & {
  question_options: QuestionOption[];
  correctOptionId: string;
};

type ClientQuizData = Pick<Tables<'quizzes'>, 'id' | 'title' | 'description'> & {
  questions: ClientQuestion[];
};

async function getQuizForPlayer(quizId: string): Promise<ClientQuizData | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
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

  if (error || !data) {
    return null;
  }

  if (!data.is_public && data.user_id !== user?.id) {
    return null;
  }
  
  // Reshape data for the client, hiding sensitive fields and simplifying the structure.
  const clientQuestions: ClientQuestion[] = data.questions.map(q => {
    const correctOption = q.question_options.find(opt => opt.is_correct);
    return {
      id: q.id,
      question: q.question,
      // Strip the 'is_correct' flag from the options sent to the client.
      question_options: q.question_options.map(({ id, option_text }) => ({ id, option_text })),
      correctOptionId: correctOption?.id || '', // Pass only the ID of the correct option.
    };
  });
  
  // Filter out any questions that might not have a correct answer for some reason
  const validQuestions = clientQuestions.filter(q => q.correctOptionId);

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    questions: validQuestions,
  };
}


export default async function QuizPage({ params }: { params: { quizId: string } }) {
    const quizId = await params.quizId;
  const quizData = await getQuizForPlayer(quizId);

  if (!quizData || quizData.questions.length === 0) {
    notFound();
  }

  return <QuizPlayer quizData={quizData} />;
} 