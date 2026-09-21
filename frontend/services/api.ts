import type {
  AnswerValue,
  Attempt,
  AttemptDetail,
  AttemptSummary,
  AuthResponse,
  CreateQuizPayload,
  Profile,
  Quiz,
  QuizForEdit,
  QuizSummary,
  User,
} from '../types/quiz';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const TOKEN_KEY = 'quiz-token';

export const tokenStore = {
  get: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* storage unavailable */
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable */
    }
  },
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message;
    throw new Error(message ?? `Request failed (${res.status})`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, password: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  me: () => request<User>('/auth/me'),
};

export const quizApi = {
  list: () => request<QuizSummary[]>('/quizzes'),
  get: (id: number | string) => request<Quiz>(`/quizzes/${id}`),
  create: (payload: CreateQuizPayload) =>
    request<Quiz>('/quizzes', { method: 'POST', body: JSON.stringify(payload) }),
  getForEdit: (id: number | string) => request<QuizForEdit>(`/quizzes/${id}/edit`),
  update: (id: number, payload: CreateQuizPayload) =>
    request<Quiz>(`/quizzes/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: number) => request<void>(`/quizzes/${id}`, { method: 'DELETE' }),
};

export const attemptApi = {
  submit: (quizId: number, answers: { questionId: number; answer: AnswerValue }[]) =>
    request<Attempt>(`/quizzes/${quizId}/attempts`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),
};

export const profileApi = {
  get: () => request<Profile>('/profile'),
  quizzes: () => request<QuizSummary[]>('/profile/quizzes'),
  attempts: () => request<AttemptSummary[]>('/profile/attempts'),
  attempt: (id: number | string) => request<AttemptDetail>(`/profile/attempts/${id}`),
};
