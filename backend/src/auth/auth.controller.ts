import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { SessionResponseDto } from './dto/session-response.dto';
import { AuthenticatedRequest, JwtAuthGuard } from './jwt-auth.guard';
import { ClientInfo } from './sessions.service';

type RequestWithClient = AuthenticatedRequest;

const clientOf = (req: RequestWithClient): ClientInfo => ({
  userAgent: req.headers['user-agent'],
  ip: req.ip,
});

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user and start a session' })
  @ApiCreatedResponse({ type: AuthResponseDto })
  @ApiConflictResponse({ description: 'Email already in use' })
  register(@Body() dto: RegisterDto, @Req() req: RequestWithClient) {
    return this.authService.register(dto, clientOf(req));
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Log in with email and password and start a session' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  login(@Body() dto: LoginDto, @Req() req: RequestWithClient) {
    return this.authService.login(dto, clientOf(req));
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Exchange a refresh token for a new access + refresh token pair' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid, expired or already used refresh token' })
  refresh(@Body() dto: RefreshDto, @Req() req: RequestWithClient) {
    return this.authService.refresh(dto.refreshToken, clientOf(req));
  }

  @Post('logout')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'End the current session' })
  @ApiNoContentResponse()
  async logout(@Req() req: RequestWithClient) {
    await this.authService.logout(req.user!.sessionId, req.user!.id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  me(@Req() req: RequestWithClient) {
    return this.usersService.findOne(req.user!.id);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List the active sessions of the current user' })
  @ApiOkResponse({ type: [SessionResponseDto] })
  sessions(@Req() req: RequestWithClient) {
    return this.authService.listSessions(req.user!.id, req.user!.sessionId);
  }

  @Delete('sessions/:id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke one of the current user’s sessions' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Session not found' })
  async revokeSession(@Param('id', ParseUUIDPipe) id: string, @Req() req: RequestWithClient) {
    const removed = await this.authService.logout(id, req.user!.id);
    if (!removed) throw new NotFoundException(`Session ${id} not found`);
  }
}
