import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SessionsService } from './sessions.service';

export interface AuthenticatedRequest {
  headers: Record<string, string | undefined>;
  ip?: string;
  user?: { id: string; email: string; sessionId: string };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly sessionsService: SessionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
    if (scheme !== 'Bearer' || !token) throw new UnauthorizedException('Missing bearer token');

    let payload: { sub: string; email: string; sid?: string };
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // The session may have been revoked (logout) while the access token is still valid.
    if (!payload.sid || !(await this.sessionsService.isActive(payload.sid, payload.sub))) {
      throw new UnauthorizedException('Session is no longer active');
    }
    request.user = { id: payload.sub, email: payload.email, sessionId: payload.sid };
    return true;
  }
}
