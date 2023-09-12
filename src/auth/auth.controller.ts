import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';
import argon2 from 'argon2';

import { UsersService } from 'src/users/users.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { RegistrationDto, LoginDto } from './dto';
import { BearerGuard } from './guards/bearer.guard';
import { SessionEntity, UserSessionEntity } from 'src/sessions/entities';
import { RefreshSessionDto } from './dto/refresh-session.dto';
import { SessionsService } from 'src/sessions/sessions.service';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    description:
      "Response returns an object with the user's profile and tokens for auth",
  })
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<UserSessionEntity> {
    const user = await this.usersService.findUserByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials. Please try again');
    }

    const isPasswordMatches = await argon2.verify(user.password, dto.password);

    if (!isPasswordMatches) {
      throw new UnauthorizedException('Invalid credentials. Please try again');
    }

    if (user.status === UserStatus.blocked) {
      throw new ForbiddenException(
        "You have been blocked by the Admin. Currently, you don't have access to the account",
      );
    }

    const session = await this.sessionsService.createSession({
      sub: user.id,
      role: user.role,
    });

    return { user: this.usersService.omitUserPrivateFields(user), session };
  }

  @Post('registration')
  @ApiOperation({ summary: 'New user registration' })
  @ApiResponse({
    description:
      "Response returns an object with the user's profile and tokens for auth",
  })
  async registration(@Body() dto: RegistrationDto): Promise<UserSessionEntity> {
    const isEmailAlreadyRegistered = await this.usersService.findUserByEmail(
      dto.email,
    );

    if (isEmailAlreadyRegistered) {
      throw new BadRequestException(
        'User with such email has been already registered',
      );
    }

    const isUsernameAlreadyRegistered =
      await this.usersService.findUserByUsername(dto.username);

    if (isUsernameAlreadyRegistered) {
      throw new BadRequestException(
        'User with such username has been already registered',
      );
    }

    dto.password = await argon2.hash(dto.password);

    const user = await this.usersService.createUser(dto);

    const session = await this.sessionsService.createSession({
      sub: user.id,
      role: user.role,
    });

    return { user, session };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh session' })
  @ApiResponse({
    description: 'Response object with tokens for auth',
  })
  refreshSession(@Body() dto: RefreshSessionDto): Promise<SessionEntity> {
    return this.sessionsService.refreshSession(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(BearerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User logout' })
  logout(
    @GetUser('sub') userId: number,
    @GetUser('accessToken') accessToken: string,
  ): void {
    this.sessionsService.removeSession(userId, accessToken);
  }
}
