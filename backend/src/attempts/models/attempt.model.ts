import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { AnswerValue, QuestionType } from '../../quizzes/models/question.model';
import { Quiz } from '../../quizzes/models/quiz.model';
import { User } from '../../users/models/user.model';

/** Snapshot of one graded question, kept so history stays readable if the quiz changes. */
export interface AttemptAnswer {
  questionId: number;
  text: string;
  type: QuestionType;
  answer: AnswerValue | null;
  correctAnswer: AnswerValue | null;
  /** Null when the question has no correct answer and is not scored. */
  isCorrect: boolean | null;
}

@Table({ tableName: 'attempts' })
export class Attempt extends Model {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Quiz)
  @Column({ type: DataType.INTEGER, allowNull: false })
  quizId: number;

  @BelongsTo(() => Quiz)
  quiz: Quiz;

  @Column({ type: DataType.INTEGER, allowNull: false })
  score: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  total: number;

  @Column({ type: DataType.JSONB, allowNull: false, defaultValue: [] })
  answers: AttemptAnswer[];
}
