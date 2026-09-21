import Link from 'next/link';
import { useEffect, useState } from 'react';
import RequireAuth from '../../components/RequireAuth';
import { profileApi } from '../../services/api';
import type { AttemptSummary, Profile, QuizSummary } from '../../types/quiz';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

function ProfileContent() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([profileApi.get(), profileApi.quizzes(), profileApi.attempts()])
      .then(([p, q, a]) => {
        setProfile(p);
        setQuizzes(q);
        setAttempts(a);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!profile) return <p className="muted">Loading…</p>;

  const { stats } = profile;

  return (
    <>
      <h1>{profile.name}</h1>
      <p className="muted">
        {profile.email} · joined {formatDate(profile.createdAt)}
      </p>

      <div className="stats">
        <div className="card stat">
          <strong>{stats.quizzesCreated}</strong>
          <span className="muted">quizzes created</span>
        </div>
        <div className="card stat">
          <strong>{stats.attemptsCount}</strong>
          <span className="muted">attempts</span>
        </div>
        <div className="card stat">
          <strong>
            {stats.averagePercent === null ? '—' : `${Math.round(stats.averagePercent)}%`}
          </strong>
          <span className="muted">average score</span>
        </div>
      </div>

      <h2>Quiz history</h2>
      {attempts.length === 0 && (
        <p className="muted">
          You haven&apos;t taken any quizzes yet. <Link href="/quizzes">Browse quizzes</Link>
        </p>
      )}
      {attempts.map((a) => (
        <Link key={a.id} href={`/profile/attempts/${a.id}`} className="card row between block-link">
          <div>
            <strong>{a.quizTitle}</strong>
            <div className="muted">{formatDate(a.createdAt)}</div>
          </div>
          <span className="badge">
            {a.score} / {a.total}
          </span>
        </Link>
      ))}

      <h2>My quizzes</h2>
      {quizzes.length === 0 && (
        <p className="muted">
          You haven&apos;t created any quizzes. <Link href="/create">Create one</Link>
        </p>
      )}
      {quizzes.map((q) => (
        <Link key={q.id} href={`/quizzes/${q.id}`} className="card row between block-link">
          <strong>{q.title}</strong>
          <span className="muted">
            {q.questionCount} question{q.questionCount === 1 ? '' : 's'}
          </span>
        </Link>
      ))}
    </>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}
