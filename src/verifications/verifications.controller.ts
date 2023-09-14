import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import argon2 from 'argon2';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VerificationTokenTypes } from '@prisma/client';

import { VerificationsService } from './verifications.service';
import { SessionsService } from 'src/sessions/sessions.service';
import { BearerGuard } from 'src/auth/guards/bearer.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UsersService } from 'src/users/users.service';
import { TokensService } from 'src/tokens/tokens.service';
import { MailerService } from 'src/mailer/mailer.service';
import {
  ValidateTokenDto,
  sendEmailToChangeEmailDto,
  SendResetPasswordDto,
  ResetPasswordDto,
  ChangeEmailDto,
  SendDeleteAccountEmailDto,
} from './dto';
import { ResetPasswordTokenPayload } from 'src/tokens/interfaces/reset-password-token-payload.interface';
import { ChangeEmailTokenPayload } from 'src/tokens/interfaces/change-email-token-payload.interface';
import { DeleteAccountTokenPayload } from 'src/tokens/interfaces/delete-account-payload.interface';

@Controller({ path: 'verifications', version: '1' })
@ApiTags('verifications')
export class VerificationsController {
  constructor(
    private readonly verificationsService: VerificationsService,
    private readonly mailerService: MailerService,
    private readonly tokensService: TokensService,
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
  ) {}

  @Post('email')
  @UseGuards(BearerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send email to change email' })
  async sendEmailToChangeEmail(
    @Body() dto: sendEmailToChangeEmailDto,
    @GetUser('sub') userId: number,
  ) {
    const user = await this.usersService.findUserByEmail(dto.email);

    if (user?.id !== userId) {
      throw new UnprocessableEntityException(
        'Invalid credentials. Please try again',
      );
    }

    const isPasswordMatches = await argon2.verify(user.password, dto.password);

    if (!isPasswordMatches) {
      throw new UnprocessableEntityException(
        'Invalid credentials. Please try again',
      );
    }

    const isEmailAlreadyRegistered = await this.usersService.findUserByEmail(
      dto.newEmail,
    );

    if (isEmailAlreadyRegistered) {
      throw new BadRequestException(
        'User with such email has been already registered',
      );
    }

    const token = await this.tokensService.createToken(
      { sub: user.id, email: dto.newEmail },
      VerificationTokenTypes.changeEmail,
    );

    await this.verificationsService.saveToken(
      user.id,
      token,
      VerificationTokenTypes.changeEmail,
    );

    await this.mailerService.sendEmailToChangeEmail(
      dto.newEmail,
      user.username,
      token,
    );
  }

  @Put('email')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Change email' })
  async changeEmail(@Body() dto: ChangeEmailDto) {
    const {
      sub: userId,
      email,
      verificationToken,
    } = await this.verificationsService.validateToken<ChangeEmailTokenPayload>(
      dto.token,
      VerificationTokenTypes.changeEmail,
    );

    const user = await this.usersService.findUserByEmail(email);

    if (user?.id === userId) {
      throw new BadRequestException(
        'Email should be different from you current email address',
      );
    }

    if (user) {
      throw new BadRequestException(
        'User with such email has been already registered',
      );
    }

    await this.verificationsService.updateToken(
      verificationToken.id,
      { isUsed: true },
      { email },
    );
  }

  @Post('password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Send reset password email' })
  async sendResetPasswordEmail(
    @Body() dto: SendResetPasswordDto,
  ): Promise<void> {
    const user = await this.usersService.findUserByEmail(dto.email);

    const token = await this.tokensService.createToken(
      { sub: user.id },
      VerificationTokenTypes.resetPassword,
    );

    await this.verificationsService.saveToken(
      user.id,
      token,
      VerificationTokenTypes.resetPassword,
    );

    await this.mailerService.sendResetPasswordEmail(
      user.email,
      user.username,
      token,
    );
  }

  @Put('password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reset password' })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    const { sub: userId, verificationToken } =
      await this.verificationsService.validateToken<ResetPasswordTokenPayload>(
        dto.token,
        VerificationTokenTypes.resetPassword,
      );

    const password = await argon2.hash(dto.password);

    await this.verificationsService.updateToken(
      verificationToken.id,
      { isUsed: true },
      { password },
    );

    await this.sessionsService.removeAllSessions(userId);
  }

  @Put('token/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Verify reset password token' })
  async validateResetPasswordToken(@Body() dto: ValidateTokenDto) {
    this.verificationsService.validateToken(
      dto.token,
      VerificationTokenTypes.resetPassword,
    );
  }

  @Post('remove-account')
  @UseGuards(BearerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send delete user account email' })
  async sendDeleteAccountEmail(
    @Body() dto: SendDeleteAccountEmailDto,
    @GetUser('sub') userId: number,
  ) {
    const user = await this.usersService.findUserById(userId);

    const isPasswordMatches = await argon2.verify(user.password, dto.password);

    if (!isPasswordMatches) {
      throw new UnprocessableEntityException(
        'Wrong password. Please try again',
      );
    }

    const token = await this.tokensService.createToken(
      { sub: userId },
      VerificationTokenTypes.deleteAccount,
    );

    await this.verificationsService.saveToken(
      userId,
      token,
      VerificationTokenTypes.deleteAccount,
    );

    await this.mailerService.sendDeleteAccountEmail(
      user.email,
      user.username,
      token,
    );
  }

  @Delete('account')
  @ApiOperation({ summary: 'Delete user account' })
  async removeAccount(@Query() queryDto: ValidateTokenDto) {
    const { sub: userId } =
      await this.verificationsService.validateToken<DeleteAccountTokenPayload>(
        queryDto.token,
        VerificationTokenTypes.deleteAccount,
      );

    await this.usersService.removeUser(userId);
    await this.sessionsService.removeAllSessions(userId);
  }
}
