import Link from 'next/link';
import type { QuizSummary } from '../types/quiz';

interface Props {
  quiz: QuizSummary;
  /** only passed for quizzes the current user owns */
  onDelete?: (id: number) => void;
  /** shown together with onDelete, for quizzes the current user owns */
  canEdit?: boolean;
}

function PencilIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M6 6l1 14h10l1-14" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export default function QuizCard({ quiz, onDelete, canEdit }: Props) {
  return (
    <div className="card row between">
      <div>
        <Link href={`/quizzes/${quiz.id}`}>
          <strong>{quiz.title}</strong>
        </Link>
        <div className="muted">
          {quiz.questionCount} question{quiz.questionCount === 1 ? '' : 's'}
        </div>
      </div>
      <div className="row">
        {canEdit && (
          <Link
            href={`/quizzes/${quiz.id}/edit`}
            className="icon-link"
            aria-label={`Edit quiz ${quiz.title}`}
            title="Edit quiz"
          >
            <PencilIcon />
          </Link>
        )}
        {onDelete && (
          <button
            type="button"
            className="icon danger"
            aria-label={`Delete quiz ${quiz.title}`}
            title="Delete quiz"
            onClick={() => onDelete(quiz.id)}
          >
            <TrashIcon />
          </button>
        )}
      </div>
    </div>
  );
}
