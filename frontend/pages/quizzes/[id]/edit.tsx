import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import QuizForm from '../../../components/QuizForm';
import RequireAuth from '../../../components/RequireAuth';
import { quizApi } from '../../../services/api';
import { refreshQuiz } from '../../../services/queries';
import type { CreateQuizPayload, QuestionDraft, QuizForEdit } from '../../../types/quiz';

/** Legacy questions have no stored correct answer: start from an empty one the owner must fill in. */
const emptyAnswer = (type: QuestionDraft['type']) =>
  type === 'boolean' ? true : type === 'checkbox' ? [] : '';

function toPayload(quiz: QuizForEdit): CreateQuizPayload {
  return {
    title: quiz.title,
    questions: quiz.questions.map((q) => ({
      text: q.text,
      type: q.type,
      options: q.options,
      correctAnswer: q.correctAnswer ?? emptyAnswer(q.type),
    })),
  };
}

function EditContent() {
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizForEdit | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.query.id) return;
    quizApi
      .getForEdit(router.query.id as string)
      .then(setQuiz)
      .catch((e: Error) => setError(e.message));
  }, [router.query.id]);

  if (error) {
    return (
      <>
        <p className="error">{error}</p>
        <Link href="/quizzes">← Back to quizzes</Link>
      </>
    );
  }
  if (!quiz) return <p className="muted">Loading…</p>;

  const handleSubmit = async (payload: CreateQuizPayload) => {
    await quizApi.update(quiz.id, payload);
    await refreshQuiz(quiz.id);
    await router.push(`/quizzes/${quiz.id}`);
  };

  return (
    <>
      <p>
        <Link href={`/quizzes/${quiz.id}`}>← Back to quiz</Link>
      </p>
      <h1>Edit quiz</h1>
      <QuizForm initial={toPayload(quiz)} submitLabel="Save changes" onSubmit={handleSubmit} />
    </>
  );
}

export default function EditQuizPage() {
  return (
    <RequireAuth>
      <EditContent />
    </RequireAuth>
  );
}
