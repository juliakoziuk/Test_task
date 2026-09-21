import { Column, DataType, DefaultScope, HasMany, Model, Scopes, Table } from 'sequelize-typescript';
import { Quiz } from '../../quizzes/models/quiz.model';

// The password hash is hidden by default; use `User.scope('withPassword')` to load it.
@DefaultScope(() => ({ attributes: { exclude: ['passwordHash'] } }))
@Scopes(() => ({ withPassword: {} }))
@Table({ tableName: 'users' })
export class User extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  passwordHash: string;

  @HasMany(() => Quiz, { onDelete: 'CASCADE', hooks: true })
  quizzes: Quiz[];
}
