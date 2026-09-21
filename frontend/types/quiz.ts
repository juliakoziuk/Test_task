export type QuestionType = 'boolean' | 'input' | 'checkbox';

export interface Question {
  id?: number;
  text: string;
  type: QuestionType;
  options: string[];
}

export interface QuizSummary {
  id: number;
  title: string;
  questionCount: number;
}

export interface Quiz {
  id: number;
  title: string;
  questions: Question[];
}

export interface CreateQuizPayload {
  title: string;
  questions: Question[];
}
