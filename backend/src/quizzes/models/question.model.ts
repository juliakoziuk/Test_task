import {
  BelongsTo,
  Column,
  DataType,
  DefaultScope,
  ForeignKey,
  Model,
  Scopes,
  Table,
} from 'sequelize-typescript';
import { Quiz } from './quiz.model';

export enum QuestionType {
  BOOLEAN = 'boolean',
  INPUT = 'input',
  CHECKBOX = 'checkbox',
}

/** boolean question -> boolean, input question -> string, checkbox question -> chosen options. */
export type AnswerValue = boolean | string | string[];

// The correct answer is hidden by default so it never leaks to quiz takers;
// use `Question.scope('withAnswers')` for grading.
@DefaultScope(() => ({ attributes: { exclude: ['correctAnswer'] } }))
@Scopes(() => ({ withAnswers: {} }))
@Table({ tableName: 'questions' })
export class Question extends Model {
  @ForeignKey(() => Quiz)
  @Column({ type: DataType.INTEGER, allowNull: false })
  quizId: number;

  @BelongsTo(() => Quiz)
  quiz: Quiz;

  @Column({ type: DataType.STRING, allowNull: false })
  text: string;

  @Column({ type: DataType.ENUM(...Object.values(QuestionType)), allowNull: false })
  type: QuestionType;

  /** Answer choices, used only by checkbox questions. */
  @Column({ type: DataType.JSONB, allowNull: false, defaultValue: [] })
  options: string[];

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  position: number;

  /** Null for legacy questions, which are not scored. */
  @Column({ type: DataType.JSONB, allowNull: true })
  correctAnswer: AnswerValue | null;
}
