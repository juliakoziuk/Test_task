import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../components/AuthProvider';
import LoginModal from '../../../components/LoginModal';
import { attemptApi, quizApi } from '../../../services/api';
import type { AnswerValue, Attempt, Question, Quiz } from '../../../types/quiz';

const TYPE_LABELS = { boolean: 'True / False', input: 'Short text', checkbox: 'Multiple choice' };

type Answers = Record<number, AnswerValue>;

interface FieldsProps {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
  disabled: boolean;
}

function AnswerFields({ question: q, value, onChange, disabled }: FieldsProps) {
  if (q.type === 'boolean') {
    return (
      <>
        {[true, false].map((option) => (
          <label key={String(option)} className="choice">
            <input
              type="radio"
              name={`q${q.id}`}
              disabled={disabled}
              checked={value === option}
              onChange={() => onChange(option)}
            />
            {option ? 'True' : 'False'}
          </label>
        ))}
      </>
    );
  }

  if (q.type === 'input') {
    return (
      <input
        type="text"
        disabled={disabled}
        placeholder="Short answer"
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  const chosen = Array.isArray(value) ? value : [];
  return (
    <>
      {q.options.map((option) => (
        <label key={option} className="choice">
          <input
            type="checkbox"
            disabled={disabled}
            checked={chosen.includes(option)}
            onChange={() =>
              onChange(
                chosen.includes(option) ? chosen.filter((c) => c !== option) : [...chosen, option],
              )
            }
          />
          {option}
        </label>
      ))}
    </>
  );
}

export default function QuizDetailPage() {
  const { query } = useRouter();
  const { user, ready } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<Attempt | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.id) return;
    quizApi
      .get(query.id as string)
      .then(setQuiz)
      .catch((e: Error) => setError(e.message));
  }, [query.id]);

  if (error) return <p className="error">{error}</p>;
  if (!quiz) return <p className="muted">Loading…</p>;

  const isGuest = ready && !user;
  const canAnswer = !!user && !result;
  // Guests see the questions read-only; trying to answer prompts them to log in.
  const askToLogin = isGuest ? () => setShowLogin(true) : undefined;
  const verdicts = new Map(result?.answers.map((a) => [a.questionId, a.isCorrect]));

  const handleSubmit = async () => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const payload = quiz.questions
        .filter((q) => answers[q.id] !== undefined)
        .map((q) => ({ questionId: q.id, answer: answers[q.id] }));
      setResult(await attemptApi.submit(quiz.id, payload));
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to submit answers.');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setAnswers({});
    setResult(null);
  };

  return (
    <>
      <div className="row between">
        <h1>{quiz.title}</h1>
        {user?.id === quiz.userId && (
          <Link href={`/quizzes/${quiz.id}/edit`} className="button secondary">
            Edit quiz
          </Link>
        )}
      </div>
      {result && (
        <div className="card result" role="status">
          <strong>
            Your score: {result.score} / {result.total}
          </strong>
          <button type="button" className="secondary" onClick={reset}>
            Try again
          </button>
        </div>
      )}
      {quiz.questions.map((q, i) => {
        const verdict = verdicts.get(q.id);
        return (
          <div
            className={`card${verdict === true ? ' correct' : verdict === false ? ' wrong' : ''}`}
            key={q.id}
          >
            <div className="row between">
              <strong>
                {i + 1}. {q.text}
              </strong>
              <span className="badge">{TYPE_LABELS[q.type]}</span>
            </div>
            <div className={`choices${isGuest ? ' guest' : ''}`} onClick={askToLogin}>
              <AnswerFields
                question={q}
                value={answers[q.id]}
                disabled={!canAnswer}
                onChange={(value) => setAnswers((prev) => ({ ...prev, [q.id]: value }))}
              />
            </div>
            {verdict !== undefined && verdict !== null && (
              <p className={verdict ? 'verdict ok' : 'verdict bad'}>
                {verdict ? 'Correct' : 'Wrong'}
              </p>
            )}
          </div>
        );
      })}
      {canAnswer && (
        <div className="row actions">
          <button type="button" disabled={submitting} onClick={handleSubmit}>
            {submitting ? 'Checking…' : 'Submit answers'}
          </button>
        </div>
      )}
      {submitError && <p className="error">{submitError}</p>}
      {showLogin && <LoginModal next={`/quizzes/${quiz.id}`} onClose={() => setShowLogin(false)} />}
    </>
  );
}
