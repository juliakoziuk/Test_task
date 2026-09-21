import type { Question, QuestionType } from '../types/quiz';

interface Props {
  index: number;
  question: Question;
  onChange: (question: Question) => void;
  onRemove: () => void;
}

export default function QuestionEditor({ index, question, onChange, onRemove }: Props) {
  const setType = (type: QuestionType) =>
    onChange({ ...question, type, options: type === 'checkbox' ? ['', ''] : [] });

  const setOption = (i: number, value: string) =>
    onChange({ ...question, options: question.options.map((o, j) => (j === i ? value : o)) });

  return (
    <div className="card">
      <div className="row between">
        <strong>Question {index + 1}</strong>
        <button type="button" className="secondary" onClick={onRemove}>
          Remove
        </button>
      </div>

      <label>Text</label>
      <input
        type="text"
        value={question.text}
        onChange={(e) => onChange({ ...question, text: e.target.value })}
        placeholder="Enter the question"
      />

      <label>Type</label>
      <select value={question.type} onChange={(e) => setType(e.target.value as QuestionType)}>
        <option value="boolean">True / False</option>
        <option value="input">Short text answer</option>
        <option value="checkbox">Multiple choice (checkboxes)</option>
      </select>

      {question.type === 'checkbox' && (
        <>
          <label>Options</label>
          {question.options.map((option, i) => (
            <div className="row" key={i} style={{ marginBottom: 6 }}>
              <input
                type="text"
                value={option}
                onChange={(e) => setOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
              />
              {question.options.length > 2 && (
                <button
                  type="button"
                  className="secondary"
                  onClick={() =>
                    onChange({ ...question, options: question.options.filter((_, j) => j !== i) })
                  }
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="secondary"
            onClick={() => onChange({ ...question, options: [...question.options, ''] })}
          >
            + Add option
          </button>
        </>
      )}
    </div>
  );
}
