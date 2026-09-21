import { AnswerValue, QuestionType } from './models/question.model';

interface QuestionLike {
  type: QuestionType;
  options?: string[];
  correctAnswer?: unknown;
}

/** Returns an error message when a question's correct answer does not fit its type, otherwise null. */
export function validateCorrectAnswer(q: QuestionLike): string | null {
  const answer = q.correctAnswer;
  switch (q.type) {
    case QuestionType.BOOLEAN:
      return typeof answer === 'boolean' ? null : 'correctAnswer must be true or false';
    case QuestionType.INPUT:
      return typeof answer === 'string' && answer.trim()
        ? null
        : 'correctAnswer must be a non-empty string';
    case QuestionType.CHECKBOX: {
      const options = q.options ?? [];
      const valid =
        Array.isArray(answer) &&
        answer.length > 0 &&
        new Set(answer).size === answer.length &&
        answer.every((a) => typeof a === 'string' && options.includes(a));
      return valid ? null : 'correctAnswer must be a non-empty list of distinct options';
    }
  }
}

/** Whether a submitted answer has the shape its question type expects. */
export function hasValidShape(type: QuestionType, answer: unknown): answer is AnswerValue {
  switch (type) {
    case QuestionType.BOOLEAN:
      return typeof answer === 'boolean';
    case QuestionType.INPUT:
      return typeof answer === 'string';
    case QuestionType.CHECKBOX:
      return Array.isArray(answer) && answer.every((a) => typeof a === 'string');
  }
}

const EDGE_PUNCTUATION = /^[\s.,;:!?"'«»()-]+|[\s.,;:!?"'«»()-]+$/g;

const clean = (value: string) =>
  value.normalize('NFC').toLowerCase().replace(/\s+/g, ' ').replace(EDGE_PUNCTUATION, '');

const splitClean = (value: string, separator: RegExp) =>
  value.split(separator).map(clean).filter(Boolean);

/**
 * Short-text answers are compared loosely: case, extra spaces and edge punctuation are ignored.
 * If the correct answer is a list ("sky, cloud, sunrise"), the user may give the items in any
 * order, separated by commas, semicolons, slashes, new lines or (for single-word items) spaces.
 */
function isInputCorrect(expected: string, given: string): boolean {
  const expectedItems = splitClean(expected, /[,;]+/);
  if (expectedItems.length < 2) return clean(expected) === clean(given);

  let givenItems = splitClean(given, /[,;/|\n]+/);
  if (givenItems.length < expectedItems.length) givenItems = splitClean(given, /[\s,;/|]+/);

  const want = new Set(expectedItems);
  const got = new Set(givenItems);
  return want.size === got.size && [...got].every((item) => want.has(item));
}

export function isCorrect(
  q: { type: QuestionType; correctAnswer: AnswerValue },
  answer: AnswerValue,
): boolean {
  switch (q.type) {
    case QuestionType.BOOLEAN:
      return answer === q.correctAnswer;
    case QuestionType.INPUT:
      return isInputCorrect(q.correctAnswer as string, answer as string);
    case QuestionType.CHECKBOX: {
      const given = new Set(answer as string[]);
      const expected = new Set(q.correctAnswer as string[]);
      return given.size === expected.size && [...given].every((a) => expected.has(a));
    }
  }
}
