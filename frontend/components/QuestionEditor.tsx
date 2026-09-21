import { useFormContext, useWatch } from 'react-hook-form';
import type { QuizFormValues } from '../schemas/quiz';
import type { AnswerValue, QuestionType } from '../types/quiz';

interface Props {
  index: number;
  onRemove: () => void;
}

const DEFAULTS: Record<QuestionType, { options: string[]; correctAnswer: AnswerValue }> = {
  boolean: { options: [], correctAnswer: true },
  input: { options: [], correctAnswer: '' },
  checkbox: { options: ['', ''], correctAnswer: [] },
};

export default function QuestionEditor({ index, onRemove }: Props) {
  const { register, control, setValue, formState } = useFormContext<QuizFormValues>();
  const base = `questions.${index}` as const;
  const error = formState.errors.questions?.[index];

  const type = useWatch({ control, name: `${base}.type` });
  const options = useWatch({ control, name: `${base}.options` }) ?? [];
  const answer = useWatch({ control, name: `${base}.correctAnswer` });
  const correct = Array.isArray(answer) ? answer : [];

  // options and the correct answer are edited together, so they are set through setValue
  const opts = { shouldDirty: true, shouldValidate: formState.isSubmitted };
  const setOptions = (value: string[]) => setValue(`${base}.options`, value, opts);
  const setCorrect = (value: AnswerValue) => setValue(`${base}.correctAnswer`, value, opts);

  const typeField = register(`${base}.type`);
  const id = `q${index}`;

  const renameOption = (i: number, value: string) => {
    const old = options[i];
    setOptions(options.map((o, j) => (j === i ? value : o)));
    // keep the "correct" mark attached to the renamed option
    setCorrect(correct.map((c) => (c === old ? value : c)));
  };

  const removeOption = (i: number) => {
    setOptions(options.filter((_, j) => j !== i));
    setCorrect(correct.filter((c) => c !== options[i]));
  };

  const toggleCorrect = (option: string) =>
    setCorrect(
      correct.includes(option) ? correct.filter((c) => c !== option) : [...correct, option],
    );

  return (
    <div className="card">
      <div className="row between">
        <strong>Question {index + 1}</strong>
        <button type="button" className="secondary" onClick={onRemove}>
          Remove
        </button>
      </div>

      <label htmlFor={`${id}-text`}>Text</label>
      <input
        id={`${id}-text`}
        type="text"
        placeholder="Enter the question"
        aria-invalid={error?.text ? true : undefined}
        {...register(`${base}.text`)}
      />
      {error?.text && <p className="field-error">{error.text.message}</p>}

      <label htmlFor={`${id}-type`}>Type</label>
      <select
        id={`${id}-type`}
        {...typeField}
        onChange={(e) => {
          void typeField.onChange(e);
          const defaults = DEFAULTS[e.target.value as QuestionType];
          setOptions(defaults.options);
          setCorrect(defaults.correctAnswer);
        }}
      >
        <option value="boolean">True / False</option>
        <option value="input">Short text answer</option>
        <option value="checkbox">Multiple choice (checkboxes)</option>
      </select>

      {type === 'boolean' && (
        <fieldset>
          <legend>Correct answer</legend>
          {[true, false].map((value) => (
            <label key={String(value)} className="choice">
              <input
                type="radio"
                name={`${id}-bool`}
                checked={answer === value}
                onChange={() => setCorrect(value)}
              />
              {value ? 'True' : 'False'}
            </label>
          ))}
        </fieldset>
      )}

      {type === 'input' && (
        <>
          <label htmlFor={`${id}-answer`}>Correct answer</label>
          <input
            id={`${id}-answer`}
            type="text"
            placeholder="Expected short answer"
            aria-invalid={error?.correctAnswer ? true : undefined}
            aria-describedby={`${id}-answer-hint`}
            {...register(`${base}.correctAnswer`)}
          />
          {error?.correctAnswer && <p className="field-error">{error.correctAnswer.message}</p>}
          <p id={`${id}-answer-hint`} className="muted">
            Case and extra spaces are ignored. For several answers separate them with commas (e.g.
            sky, cloud, sunrise): players can list them in any order.
          </p>
        </>
      )}

      {type === 'checkbox' && (
        <fieldset>
          <legend>Options (tick every correct one)</legend>
          {options.map((option, i) => (
            <div key={i}>
              <div className="row option-row">
                <input
                  type="checkbox"
                  aria-label={`Option ${i + 1} is correct`}
                  checked={option.trim() !== '' && correct.includes(option)}
                  disabled={option.trim() === ''}
                  onChange={() => toggleCorrect(option)}
                />
                <input
                  type="text"
                  aria-label={`Option ${i + 1}`}
                  aria-invalid={error?.options?.[i] ? true : undefined}
                  value={option}
                  onChange={(e) => renameOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    className="secondary"
                    aria-label={`Remove option ${i + 1}`}
                    onClick={() => removeOption(i)}
                  >
                    ×
                  </button>
                )}
              </div>
              {error?.options?.[i] && <p className="field-error">{error.options[i]?.message}</p>}
            </div>
          ))}
          <button type="button" className="secondary" onClick={() => setOptions([...options, ''])}>
            + Add option
          </button>
          {error?.correctAnswer && <p className="field-error">{error.correctAnswer.message}</p>}
        </fieldset>
      )}
    </div>
  );
}
