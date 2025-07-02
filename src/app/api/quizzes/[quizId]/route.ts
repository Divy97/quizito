import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function DELETE(
  req: Request,
  { params }: { params: { quizId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quizId } = await params;

    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 });
    }

    // RLS policy ensures that a user can only delete their own quiz.
    // The policy is on the 'quizzes' table:
    // "Users can view, update, and delete their own quizzes."
    // ON quizzes FOR ALL USING (auth.uid() = user_id);
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId)
      .eq('user_id', user.id); // Extra check for safety

    if (error) {
      console.error('Error deleting quiz:', error);
      if (error.code === 'PGRST204') {
        // This code means the item was not found, which could be due to RLS.
        // It's safer to treat it as a permissions issue.
        return NextResponse.json({ error: 'Quiz not found or you do not have permission to delete it.' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to delete quiz.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Quiz deleted successfully.' }, { status: 200 });
  } catch (err) {
    console.error('[QUIZ_DELETE_ERROR]', err);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
} 