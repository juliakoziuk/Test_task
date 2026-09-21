import { z } from 'zod';

const questionSchema = z
  .object({
    text: z.string().trim().min(1, 'Question text is required.'),
    type: z.enum(['boolean', 'input', 'checkbox']),
    options: z.array(z.string().trim()),
    correctAnswer: z.union([z.boolean(), z.string().trim(), z.array(z.string().trim())]),
  })
  .superRefine((q, ctx) => {
    if (q.type === 'input') {
      if (typeof q.correctAnswer !== 'string' || !q.correctAnswer) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['correctAnswer'],
          message: 'Correct answer is required.',
        });
      }
      return;
    }

    if (q.type !== 'checkbox') return;

    q.options.forEach((option, i) => {
      if (!option) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['options', i],
          message: 'Option cannot be empty.',
        });
      } else if (q.options.indexOf(option) !== i) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['options', i],
          message: 'Options must be different.',
        });
      }
    });

    const correct = Array.isArray(q.correctAnswer) ? q.correctAnswer : [];
    if (correct.length === 0 || !correct.every((c) => q.options.includes(c))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['correctAnswer'],
        message: 'Tick at least one correct option.',
      });
    }
  });

export const quizSchema = z.object({
  title: z.string().trim().min(1, 'Quiz title is required.'),
  questions: z.array(questionSchema).min(1, 'Add at least one question.'),
});

export type QuizFormValues = z.infer<typeof quizSchema>;
