import Link from 'next/link';
import { useAuth } from './AuthProvider';

export default function Nav() {
  const { user, ready, signOut } = useAuth();

  return (
    <nav className="nav">
      <Link href="/quizzes">Quizzes</Link>
      <Link href="/create">Create quiz</Link>
      <span className="spacer" />
      {ready && user && (
        <>
          <Link href="/profile" title="My profile">
            {user.name}
          </Link>
          <button type="button" className="secondary" onClick={signOut}>
            Log out
          </button>
        </>
      )}
      {ready && !user && <Link href="/login">Log in</Link>}
    </nav>
  );
}
