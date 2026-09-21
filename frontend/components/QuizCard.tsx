import Link from 'next/link';
import type { QuizSummary } from '../types/quiz';

interface Props {
  quiz: QuizSummary;
  onDelete: (id: number) => void;
}

export default function QuizCard({ quiz, onDelete }: Props) {
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
      <button className="danger" onClick={() => onDelete(quiz.id)}>
        Delete
      </button>
    </div>
  );
}
