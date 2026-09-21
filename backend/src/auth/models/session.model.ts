import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { User } from '../../users/models/user.model';

/** One logged-in device/browser. Deleting the row logs that session out. */
@Table({ tableName: 'sessions' })
export class Session extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  userId: string;

  @BelongsTo(() => User)
  user: User;

  /** SHA-256 of the current refresh token. */
  @Column({ type: DataType.STRING, allowNull: false })
  refreshTokenHash: string;

  @Column({ type: DataType.STRING, allowNull: true })
  userAgent: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  ip: string | null;

  @Column({ type: DataType.DATE, allowNull: false })
  expiresAt: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  lastUsedAt: Date;
}
