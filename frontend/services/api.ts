import type { CreateQuizPayload, Quiz, QuizSummary } from '../types/quiz';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message;
    throw new Error(message ?? `Request failed (${res.status})`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export const quizApi = {
  list: () => request<QuizSummary[]>('/quizzes'),
  get: (id: number | string) => request<Quiz>(`/quizzes/${id}`),
  create: (payload: CreateQuizPayload) =>
    request<Quiz>('/quizzes', { method: 'POST', body: JSON.stringify(payload) }),
  remove: (id: number) => request<void>(`/quizzes/${id}`, { method: 'DELETE' }),
};
