import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { quizApi } from '../../services/api';
import type { Quiz } from '../../types/quiz';

const TYPE_LABELS = { boolean: 'True / False', input: 'Short text', checkbox: 'Multiple choice' };

export default function QuizDetailPage() {
  const { query } = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.id) return;
    quizApi.get(query.id as string).then(setQuiz).catch((e: Error) => setError(e.message));
  }, [query.id]);

  if (error) return <p className="error">{error}</p>;
  if (!quiz) return <p className="muted">Loading…</p>;

  return (
    <>
      <h1>{quiz.title}</h1>
      {quiz.questions.map((q, i) => (
        <div className="card" key={q.id}>
          <div className="row between">
            <strong>
              {i + 1}. {q.text}
            </strong>
            <span className="badge">{TYPE_LABELS[q.type]}</span>
          </div>
          {q.type === 'checkbox' && (
            <ul className="options">
              {q.options.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </>
  );
}
