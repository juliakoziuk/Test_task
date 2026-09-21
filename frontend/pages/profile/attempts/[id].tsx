import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import RequireAuth from '../../../components/RequireAuth';
import { profileApi } from '../../../services/api';
import type { AttemptDetail, AnswerValue } from '../../../types/quiz';

function formatAnswer(value: AnswerValue | null): string {
  if (value === null || value === undefined || value === '') return 'No answer';
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  if (Array.isArray(value)) return value.length ? value.join(', ') : 'No answer';
  return value;
}

function AttemptContent() {
  const { query } = useRouter();
  const [attempt, setAttempt] = useState<AttemptDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.id) return;
    profileApi
      .attempt(query.id as string)
      .then(setAttempt)
      .catch((e: Error) => setError(e.message));
  }, [query.id]);

  if (error) return <p className="error">{error}</p>;
  if (!attempt) return <p className="muted">Loading…</p>;

  return (
    <>
      <p>
        <Link href="/profile">← Back to profile</Link>
      </p>
      <h1>{attempt.quizTitle}</h1>
      <p className="muted">
        Score: {attempt.score} / {attempt.total} ·{' '}
        {new Date(attempt.createdAt).toLocaleString(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}
      </p>

      {attempt.answers.map((a, i) => (
        <div
          key={a.questionId}
          className={`card${a.isCorrect === true ? ' correct' : a.isCorrect === false ? ' wrong' : ''}`}
        >
          <strong>
            {i + 1}. {a.text}
          </strong>
          <p className="muted">Your answer: {formatAnswer(a.answer)}</p>
          {a.isCorrect === false && (
            <p className="muted">Correct answer: {formatAnswer(a.correctAnswer)}</p>
          )}
          {a.isCorrect !== null && (
            <p className={a.isCorrect ? 'verdict ok' : 'verdict bad'}>
              {a.isCorrect ? 'Correct' : 'Wrong'}
            </p>
          )}
        </div>
      ))}
    </>
  );
}

export default function AttemptPage() {
  return (
    <RequireAuth>
      <AttemptContent />
    </RequireAuth>
  );
}
