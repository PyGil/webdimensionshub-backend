import {
  Controller,
  Get,
  Body,
  Patch,
  UseGuards,
  Param,
  ParseIntPipe,
  NotFoundException,
  BadRequestException,
  Put,
  UnprocessableEntityException,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User, UserRole, UserStatus } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import argon2 from 'argon2';

import { UsersService } from './users.service';
import { SessionEntity } from 'src/sessions/entities';
import { UpdateUserDto, ChangeUserStatusDto, UpdatePasswordDto } from './dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UserEntity } from './entities/user.entity';
import { SessionsService } from 'src/sessions/sessions.service';
import { BearerGuard } from 'src/auth/guards/bearer.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UseRoles } from 'src/common/decorators/use-roles.decorator';
import { MailerService } from 'src/mailer/mailer.service';
import { IMAGES_TYPE_REGEX } from 'src/common/constants/regular-expressions';
import { MAX_FILE_SIZE } from 'src/common/constants/validations';
import { S3Service } from 'src/s3/s3.service';
import { getFileNameFromS3Url } from 'src/common/utils/get-file-name-from-s3-url';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
    private readonly mailerService: MailerService,
    private readonly s3Service: S3Service,
  ) {}

  @Get('me')
  @UseGuards(BearerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my profile' })
  @ApiResponse({
    description: "Response returns an object with the user's profile",
  })
  async getMe(@GetUser('sub') userId: number): Promise<UserEntity> {
    const user = await this.usersService.findUserById(userId);

    return this.usersService.omitUserPrivateFields(user);
  }

  @Patch('me')
  @UseGuards(BearerGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update my profile' })
  @ApiResponse({
    description: "Response returns an object with the user's profile",
  })
  @ApiConsumes('multipart/form-data')
  async updateMe(
    @GetUser('sub') userId: number,
    @Body() dto: UpdateUserDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: IMAGES_TYPE_REGEX }),
        ],
        fileIsRequired: false,
      }),
    )
    avatar: Express.Multer.File,
  ): Promise<UserEntity> {
    if (dto.username) {
      const isUsernameAlreadyRegistered =
        await this.usersService.findUserByUsername(dto.username);

      if (isUsernameAlreadyRegistered) {
        throw new BadRequestException(
          'User with such username has been already registered',
        );
      }
    }

    const paramsToUpdate: Partial<User> = { username: dto.username };

    if (avatar) {
      const user = await this.usersService.findUserById(userId);

      user.avatarUrl &&
        (await this.s3Service.deleteFile(getFileNameFromS3Url(user.avatarUrl)));

      const avatarKey = await this.s3Service.uploadFile(avatar, userId);

      paramsToUpdate.avatarUrl = this.s3Service.getUrlFromCloudFront(avatarKey);
    }

    return this.usersService.updateUser(userId, paramsToUpdate);
  }

  @Put('me/password')
  @UseGuards(BearerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change my password' })
  @ApiResponse({
    description: 'Response returns an object with tokens for auth',
  })
  async changePassword(
    @Body() dto: UpdatePasswordDto,
    @GetUser('sub') userId: number,
  ): Promise<SessionEntity> {
    const user = await this.usersService.findUserById(userId);

    const isPasswordMatches = await argon2.verify(user.password, dto.password);

    if (!isPasswordMatches) {
      throw new UnprocessableEntityException(
        'Wrong Password. Please try again',
      );
    }

    const password = await argon2.hash(dto.newPassword);

    this.usersService.updateUser(userId, { password });

    await this.sessionsService.removeAllSessions(userId);

    return this.sessionsService.createSession({
      sub: user.id,
      role: user.role,
    });
  }

  @Put(':userId/status')
  @UseRoles(UserRole.admin)
  @UseGuards(BearerGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: `Change user status. Statuses: ${UserStatus.active}, ${UserStatus.blocked}. Only for Admin`,
  })
  @ApiResponse({
    description:
      'Response returns object with user profile. The user will be informed about his status changes by email',
  })
  async changeUserStatus(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: ChangeUserStatusDto,
  ): Promise<UserEntity> {
    const user = await this.usersService.findUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      user.status === UserStatus.blocked &&
      dto.status === UserStatus.blocked
    ) {
      throw new BadRequestException('User has already been blocked');
    }

    if (user.status === UserStatus.active && dto.status === UserStatus.active) {
      throw new BadRequestException('User has not been blocked');
    }

    if (dto.status === UserStatus.blocked) {
      const [blockedUser] = await Promise.all([
        this.usersService.blockUser(userId),
        this.sessionsService.removeAllSessions(userId),
        this.mailerService.sendUserBlockedEmail(user.email, user.username),
      ]);

      return blockedUser;
    }

    const [unblockedUser] = await Promise.all([
      this.usersService.unblockUser(userId),
      this.mailerService.sendUserBlockedEmail(user.email, user.username),
    ]);

    return unblockedUser;
  }
}
