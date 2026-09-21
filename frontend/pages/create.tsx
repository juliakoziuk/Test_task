import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import QuizForm from '../components/QuizForm';
import { quizApi } from '../services/api';
import type { CreateQuizPayload } from '../types/quiz';

export default function CreateQuizPage() {
  const router = useRouter();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (ready && !user) void router.replace({ pathname: '/login', query: { next: '/create' } });
  }, [ready, user, router]);

  const handleSubmit = async (payload: CreateQuizPayload) => {
    const quiz = await quizApi.create(payload);
    await router.push(`/quizzes/${quiz.id}`);
  };

  if (!ready || !user) {
    return (
      <p className="muted">
        {ready ? (
          <>
            Please <Link href="/login">log in</Link> to create a quiz.
          </>
        ) : (
          'Loading…'
        )}
      </p>
    );
  }

  return (
    <>
      <h1>Create quiz</h1>
      <QuizForm onSubmit={handleSubmit} />
    </>
  );
}
