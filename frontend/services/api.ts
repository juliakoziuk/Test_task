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
const ACCESS_KEY = 'quiz-token';
const REFRESH_KEY = 'quiz-refresh-token';
const USER_KEY = 'quiz-user';

const storage = (key: string) => ({
  get: (): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* storage unavailable */
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(key);
    } catch {
      /* storage unavailable */
    }
  },
});

const accessStore = storage(ACCESS_KEY);
const refreshStore = storage(REFRESH_KEY);
const cachedUser = storage(USER_KEY);

export const tokenStore = {
  get: accessStore.get,
  set: (auth: Pick<AuthResponse, 'accessToken' | 'refreshToken'>) => {
    accessStore.set(auth.accessToken);
    refreshStore.set(auth.refreshToken);
  },
  clear: () => {
    accessStore.clear();
    refreshStore.clear();
  },
};

/** Last known user, kept so the UI can render before `/auth/me` answers. */
export const userStore = {
  get: (): User | null => {
    try {
      return JSON.parse(cachedUser.get() ?? 'null') as User | null;
    } catch {
      return null;
    }
  },
  set: (user: User) => cachedUser.set(JSON.stringify(user)),
  clear: cachedUser.clear,
};

async function parseError(res: Response): Promise<Error> {
  const body = await res.json().catch(() => null);
  const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message;
  return new Error(message ?? `Request failed (${res.status})`);
}

// Shared so that parallel 401s trigger a single refresh (refresh tokens are single-use).
let refreshing: Promise<boolean> | null = null;

function refreshTokens(): Promise<boolean> {
  refreshing ??= (async () => {
    const refreshToken = refreshStore.get();
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        tokenStore.clear();
        return false;
      }
      tokenStore.set((await res.json()) as AuthResponse);
      return true;
    } catch {
      return false; // network error: keep the tokens and let the caller fail
    }
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const token = tokenStore.get();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (res.status === 401 && token && retry && (await refreshTokens())) {
    return request<T>(path, init, false);
  }
  if (!res.ok) throw await parseError(res);
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
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
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
