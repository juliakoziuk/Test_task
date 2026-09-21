import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from './jwt-auth.guard';

/** Id of the authenticated user; use together with `JwtAuthGuard`. */
export const CurrentUserId = createParamDecorator((_data: unknown, ctx: ExecutionContext): number => {
  return ctx.switchToHttp().getRequest<AuthenticatedRequest>().user!.id;
});
