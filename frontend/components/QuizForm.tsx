import { FormEvent, useState } from 'react';
import type { CreateQuizPayload, Question } from '../types/quiz';
import QuestionEditor from './QuestionEditor';

interface Props {
  onSubmit: (payload: CreateQuizPayload) => Promise<void>;
}

const emptyQuestion = (): Question => ({ text: '', type: 'boolean', options: [] });

function validate(title: string, questions: Question[]): string | null {
  if (!title.trim()) return 'Quiz title is required.';
  if (questions.length === 0) return 'Add at least one question.';
  for (const [i, q] of questions.entries()) {
    if (!q.text.trim()) return `Question ${i + 1} needs text.`;
    if (q.type === 'checkbox' && q.options.some((o) => !o.trim())) {
      return `Question ${i + 1} has an empty option.`;
    }
  }
  return null;
}

export default function QuizForm({ onSubmit }: Props) {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const problem = validate(title, questions);
    if (problem) return setError(problem);

    setError(null);
    setSaving(true);
    try {
      await onSubmit({ title: title.trim(), questions });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="card">
        <label>Quiz title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. JavaScript Basics"
        />
      </div>

      {questions.map((q, i) => (
        <QuestionEditor
          key={i}
          index={i}
          question={q}
          onChange={(next) => setQuestions(questions.map((x, j) => (j === i ? next : x)))}
          onRemove={() => setQuestions(questions.filter((_, j) => j !== i))}
        />
      ))}

      <div className="row">
        <button type="button" className="secondary" onClick={() => setQuestions([...questions, emptyQuestion()])}>
          + Add question
        </button>
        <button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Create quiz'}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
