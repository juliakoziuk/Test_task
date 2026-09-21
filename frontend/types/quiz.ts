export type QuestionType = 'boolean' | 'input' | 'checkbox';

export interface Question {
  id: number;
  text: string;
  type: QuestionType;
  options: string[];
}

export interface QuizSummary {
  id: number;
  userId: number;
  title: string;
  questionCount: number;
}

export interface Quiz {
  id: number;
  userId: number;
  title: string;
  questions: Question[];
}

export type AnswerValue = boolean | string | string[];

export interface QuestionDraft {
  text: string;
  type: QuestionType;
  options: string[];
  correctAnswer: AnswerValue;
}

export interface CreateQuizPayload {
  title: string;
  questions: QuestionDraft[];
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface AttemptAnswer {
  questionId: number;
  text: string;
  type: QuestionType;
  answer: AnswerValue | null;
  correctAnswer: AnswerValue | null;
  /** null when the question is not scored */
  isCorrect: boolean | null;
}

export interface Attempt {
  id: number;
  quizId: number;
  quizTitle: string;
  score: number;
  total: number;
  answers: AttemptAnswer[];
}

export interface AttemptSummary {
  id: number;
  quizId: number;
  quizTitle: string;
  score: number;
  total: number;
  createdAt: string;
}

export interface AttemptDetail extends AttemptSummary {
  answers: AttemptAnswer[];
}

export interface Profile extends User {
  createdAt: string;
  stats: {
    quizzesCreated: number;
    attemptsCount: number;
    /** percent; null without attempts */
    averagePercent: number | null;
  };
}

export interface QuizForEdit {
  id: number;
  userId: number;
  title: string;
  questions: (Question & { correctAnswer: AnswerValue | null })[];
}
