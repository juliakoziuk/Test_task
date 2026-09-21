import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { QuizFormValues, quizSchema } from '../schemas/quiz';
import type { CreateQuizPayload } from '../types/quiz';
import QuestionEditor from './QuestionEditor';

interface Props {
  onSubmit: (payload: CreateQuizPayload) => Promise<void>;
  /** prefill when editing an existing quiz */
  initial?: CreateQuizPayload;
  submitLabel?: string;
}

const emptyQuestion = (): QuizFormValues['questions'][number] => ({
  text: '',
  type: 'boolean',
  options: [],
  correctAnswer: true,
});

export default function QuizForm({ onSubmit, initial, submitLabel = 'Create quiz' }: Props) {
  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    mode: 'onTouched',
    defaultValues: initial ?? { title: '', questions: [emptyQuestion()] },
  });
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = form;
  const { fields, append, remove } = useFieldArray({ control, name: 'questions' });
  const [serverError, setServerError] = useState<string | null>(null);

  // the resolver returns trimmed values, so what is sent matches what was validated
  const submit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  });

  const questionsError = errors.questions?.root?.message ?? errors.questions?.message;

  return (
    <FormProvider {...form}>
      <form onSubmit={submit} noValidate>
        <div className="card">
          <label htmlFor="quiz-title">Quiz title</label>
          <input
            id="quiz-title"
            type="text"
            placeholder="e.g. JavaScript Basics"
            aria-invalid={errors.title ? true : undefined}
            {...register('title')}
          />
          {errors.title && <p className="field-error">{errors.title.message}</p>}
        </div>

        {fields.map((field, i) => (
          <QuestionEditor key={field.id} index={i} onRemove={() => remove(i)} />
        ))}

        {questionsError && <p className="error">{questionsError}</p>}

        <div className="row actions">
          <button type="button" className="secondary" onClick={() => append(emptyQuestion())}>
            + Add question
          </button>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : submitLabel}
          </button>
        </div>
        {serverError && <p className="error">{serverError}</p>}
      </form>
    </FormProvider>
  );
}
