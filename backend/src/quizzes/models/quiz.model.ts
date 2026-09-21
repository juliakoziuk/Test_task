import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
import { Question } from './question.model';

@Table({ tableName: 'quizzes' })
export class Quiz extends Model {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: string;

  @BelongsTo(() => User)
  user: User;

  @Column({ type: DataType.STRING, allowNull: false })
  title: string;

  @HasMany(() => Question, { onDelete: 'CASCADE', hooks: true })
  questions: Question[];
}
