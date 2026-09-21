import Link from 'next/link';
import { useEffect } from 'react';

interface Props {
  /** where to return after logging in */
  next: string;
  onClose: () => void;
}

export default function LoginModal({ next, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const query = { next };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="login-modal-title">Log in to solve quizzes</h2>
        <p className="muted">You need to be registered and logged in to answer quiz questions.</p>
        <div className="row actions">
          <Link href={{ pathname: '/login', query }} className="button">
            Log in
          </Link>
          <Link href={{ pathname: '/register', query }} className="button secondary">
            Register
          </Link>
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
