import useSWR, { mutate } from 'swr';
import type { Quiz, QuizSummary } from '../types/quiz';
import { quizApi } from './api';

/**
 * Client-side cache for public quiz data (stale-while-revalidate): pages show the cached copy
 * immediately when you come back to them and refresh it in the background.
 */
export const keys = {
  quizzes: '/quizzes',
  quiz: (id: number | string) => `/quizzes/${id}`,
};

export const useQuizzes = () => useSWR<QuizSummary[], Error>(keys.quizzes, () => quizApi.list());

export const useQuiz = (id: string | undefined) =>
  useSWR<Quiz, Error>(id ? keys.quiz(id) : null, () => quizApi.get(id as string));

/** Drop stale copies after a quiz was created, edited or deleted. */
export const refreshQuiz = (id: number) =>
  Promise.all([mutate(keys.quizzes), mutate(keys.quiz(id))]);

export const forgetQuiz = (id: number) =>
  Promise.all([
    mutate<QuizSummary[]>(keys.quizzes, (list) => list?.filter((q) => q.id !== id), {
      revalidate: false,
    }),
    mutate(keys.quiz(id), undefined, { revalidate: false }),
  ]);
