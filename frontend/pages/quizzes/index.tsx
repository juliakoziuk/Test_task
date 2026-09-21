import { useEffect, useState } from 'react';
import QuizCard from '../../components/QuizCard';
import { quizApi } from '../../services/api';
import type { QuizSummary } from '../../types/quiz';

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState<QuizSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    quizApi.list().then(setQuizzes).catch((e: Error) => setError(e.message));
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this quiz?')) return;
    try {
      await quizApi.remove(id);
      setQuizzes((prev) => prev?.filter((q) => q.id !== id) ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete quiz.');
    }
  };

  return (
    <>
      <h1>Quizzes</h1>
      {error && <p className="error">{error}</p>}
      {quizzes === null && !error && <p className="muted">Loading…</p>}
      {quizzes?.length === 0 && <p className="muted">No quizzes yet. Create the first one!</p>}
      {quizzes?.map((quiz) => (
        <QuizCard key={quiz.id} quiz={quiz} onDelete={handleDelete} />
      ))}
    </>
  );
}
