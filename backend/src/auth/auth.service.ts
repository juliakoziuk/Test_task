import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/models/user.model';
import { UsersService } from '../users/users.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SessionResponseDto } from './dto/session-response.dto';
import { ClientInfo, SessionsService } from './sessions.service';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto, client: ClientInfo): Promise<AuthResponseDto> {
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });
    return this.startSession(user, client);
  }

  async login(dto: LoginDto, client: ClientInfo): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    const valid = user && (await bcrypt.compare(dto.password, user.passwordHash));
    if (!user || !valid) throw new UnauthorizedException('Invalid email or password');
    return this.startSession(user, client);
  }

  async refresh(refreshToken: string, client: ClientInfo): Promise<AuthResponseDto> {
    const { session, refreshToken: nextRefreshToken } = await this.sessionsService.rotate(
      refreshToken,
      client,
    );
    const user = await this.usersService.findOne(session.userId);
    return this.buildResponse(user, session.id, nextRefreshToken);
  }

  logout(sessionId: string, userId: string): Promise<boolean> {
    return this.sessionsService.revoke(sessionId, userId);
  }

  async listSessions(userId: string, currentSessionId: string): Promise<SessionResponseDto[]> {
    const sessions = await this.sessionsService.findAllForUser(userId);
    return sessions.map((s) => ({
      id: s.id,
      userAgent: s.userAgent,
      ip: s.ip,
      createdAt: s.createdAt,
      lastUsedAt: s.lastUsedAt,
      expiresAt: s.expiresAt,
      current: s.id === currentSessionId,
    }));
  }

  private async startSession(user: User, client: ClientInfo): Promise<AuthResponseDto> {
    const { session, refreshToken } = await this.sessionsService.create(user.id, client);
    return this.buildResponse(user, session.id, refreshToken);
  }

  private async buildResponse(
    user: User,
    sessionId: string,
    refreshToken: string,
  ): Promise<AuthResponseDto> {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      sid: sessionId,
    });
    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }
}
