import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode, useEffect } from 'react';
import { useAuth } from './AuthProvider';

/** Renders children only for logged-in users; others are sent to /login and back. */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (ready && !user) {
      void router.replace({ pathname: '/login', query: { next: router.asPath } });
    }
  }, [ready, user, router]);

  if (!ready) return <p className="muted">Loading…</p>;
  if (!user) {
    return (
      <p className="muted">
        Please <Link href="/login">log in</Link> to continue.
      </p>
    );
  }
  return <>{children}</>;
}
