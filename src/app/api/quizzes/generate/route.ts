import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import {
  researchChain,
  questionGenerationChain,
  outputParser,
} from '@/lib/quiz-generation';

const quizGenSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long.'),
  description: z.string().optional(),
  source_type: z.enum(['topic', 'url', 'youtube']),
  source_data: z.string().min(3, 'The source must be at least 3 characters long.'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  question_count: z.number().min(3).max(10),
  is_public: z.boolean(),
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = quizGenSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { source_type, source_data, difficulty, question_count, title, description, is_public } = validation.data;

    try {
      if (source_type === 'topic') {
        console.log('Generating quiz from topic:', source_data);

        const researchOutput = await researchChain.invoke({
          topic: source_data,
          difficulty,
          question_count,
        });

        const format_instructions = outputParser.getFormatInstructions();

        const questionsPayload = await questionGenerationChain.invoke({
          source_text: researchOutput,
          question_count,
          format_instructions,
        });

        const { questions } = questionsPayload;

        // --- DATABASE TRANSACTION ---
        const supabase = await createClient();

        // 1. Create the quiz entry
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .insert({
            user_id: user.id,
            title,
            description,
            source_type,
            source_data,
            difficulty,
            question_count,
            is_public,
          })
          .select('id')
          .single();

        if (quizError || !quizData) {
          console.error('Error creating quiz:', quizError);
          return NextResponse.json({ error: 'Failed to create quiz.' }, { status: 500 });
        }
        
        const quizId = quizData.id;

        // 2. Add questions and options
        for (const question of questions) {
          const { data: questionData, error: questionError } = await supabase
            .from('questions')
            .insert({
              quiz_id: quizId,
              question: question.question,
              explanation: question.explanation,
            })
            .select('id')
            .single();
          
          if (questionError || !questionData) {
            console.error('Error creating question:', questionError);
            // TODO: Add cleanup logic to delete the quiz if a question fails
            return NextResponse.json({ error: 'Failed to create questions.' }, { status: 500 });
          }

          const questionId = questionData.id;

          const optionsToInsert = question.options.map((opt) => ({
            question_id: questionId,
            option_text: opt.option_text,
            is_correct: opt.is_correct,
          }));

          const { error: optionsError } = await supabase
            .from('question_options')
            .insert(optionsToInsert);
          
          if (optionsError) {
            console.error('Error creating options:', optionsError);
            // TODO: Add cleanup logic
            return NextResponse.json({ error: 'Failed to create question options.' }, { status: 500 });
          }
        }

        return NextResponse.json({ quizId });

      } else if (source_type === 'url') {
        return NextResponse.json({ error: 'URL source type not yet implemented.' }, { status: 501 });
      } else if (source_type === 'youtube') {
        return NextResponse.json({ error: 'YouTube source type not yet implemented.' }, { status: 501 });
      }

      return NextResponse.json({ error: 'Invalid source type.' }, { status: 400 });

    } catch (error) {
      console.error('[QUIZ_GENERATION_ERROR]', error);
      if (error instanceof z.ZodError) {
        return new NextResponse('Invalid request payload', { status: 422 });
      }
      return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
    }

  } catch (error) {
    console.error('[QUIZ_GENERATION_ERROR]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request payload', { status: 422 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
} 