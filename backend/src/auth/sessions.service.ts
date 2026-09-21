import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { Op } from 'sequelize';
import { Session } from './models/session.model';

export interface ClientInfo {
  userAgent?: string;
  ip?: string;
}

export interface IssuedSession {
  session: Session;
  /** Opaque token `<sessionId>.<secret>`; returned to the client once, only its hash is stored. */
  refreshToken: string;
}

const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const newSecret = () => randomBytes(48).toString('base64url');

@Injectable()
export class SessionsService {
  private readonly ttlMs: number;

  constructor(
    @InjectModel(Session) private readonly sessionModel: typeof Session,
    config: ConfigService,
  ) {
    this.ttlMs = Number(config.get('REFRESH_TOKEN_TTL_DAYS', 30)) * 24 * 60 * 60 * 1000;
  }

  async create(userId: string, client: ClientInfo): Promise<IssuedSession> {
    const secret = newSecret();
    const now = new Date();
    const session = await this.sessionModel.create({
      userId,
      refreshTokenHash: hash(secret),
      userAgent: client.userAgent?.slice(0, 255) ?? null,
      ip: client.ip ?? null,
      expiresAt: new Date(now.getTime() + this.ttlMs),
      lastUsedAt: now,
    });
    return { session, refreshToken: `${session.id}.${secret}` };
  }

  /**
   * Validates a refresh token and rotates it. A token that no longer matches the
   * session (already used, i.e. replayed or stolen) revokes the whole session.
   */
  async rotate(refreshToken: string, client: ClientInfo): Promise<IssuedSession> {
    const [sessionId, secret] = refreshToken.split('.');
    const invalid = new UnauthorizedException('Invalid refresh token');
    if (!sessionId || !secret) throw invalid;

    const session = await this.sessionModel.findOne({
      where: { id: sessionId, expiresAt: { [Op.gt]: new Date() } },
    });
    if (!session) throw invalid;

    const expected = Buffer.from(session.refreshTokenHash);
    const actual = Buffer.from(hash(secret));
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      await session.destroy();
      throw invalid;
    }

    const nextSecret = newSecret();
    const now = new Date();
    await session.update({
      refreshTokenHash: hash(nextSecret),
      expiresAt: new Date(now.getTime() + this.ttlMs),
      lastUsedAt: now,
      userAgent: client.userAgent?.slice(0, 255) ?? session.userAgent,
      ip: client.ip ?? session.ip,
    });
    return { session, refreshToken: `${session.id}.${nextSecret}` };
  }

  async isActive(sessionId: string, userId: string): Promise<boolean> {
    const count = await this.sessionModel.count({
      where: { id: sessionId, userId, expiresAt: { [Op.gt]: new Date() } },
    });
    return count > 0;
  }

  findAllForUser(userId: string): Promise<Session[]> {
    return this.sessionModel.findAll({
      where: { userId, expiresAt: { [Op.gt]: new Date() } },
      order: [['lastUsedAt', 'DESC']],
    });
  }

  /** Returns whether a session owned by the user was removed. */
  async revoke(sessionId: string, userId: string): Promise<boolean> {
    return (await this.sessionModel.destroy({ where: { id: sessionId, userId } })) > 0;
  }
}
