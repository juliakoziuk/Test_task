import { useState } from 'react';
import { useAuth } from '../../components/AuthProvider';
import QuizCard from '../../components/QuizCard';
import { quizApi } from '../../services/api';
import { forgetQuiz, useQuizzes } from '../../services/queries';

export default function QuizListPage() {
  const { user } = useAuth();
  const { data: quizzes, error: loadError } = useQuizzes();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const error = deleteError ?? (quizzes ? null : (loadError?.message ?? null));

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this quiz?')) return;
    try {
      await quizApi.remove(id);
      await forgetQuiz(id);
      setDeleteError(null);
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Failed to delete quiz.');
    }
  };

  return (
    <>
      <h1>Quizzes</h1>
      {error && <p className="error">{error}</p>}
      {!quizzes && !error && <p className="muted">Loading…</p>}
      {quizzes?.length === 0 && <p className="muted">No quizzes yet. Create the first one!</p>}
      {quizzes?.map((quiz) => (
        <QuizCard
          key={quiz.id}
          quiz={quiz}
          canEdit={user?.id === quiz.userId}
          onDelete={user?.id === quiz.userId ? handleDelete : undefined}
        />
      ))}
    </>
  );
}
