import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseFilePipe,
  UploadedFile,
  ParseIntPipe,
  NotFoundException,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { SpidersService } from './spiders.service';
import { CreateSpiderDto } from './dto/create-spider.dto';
import { UpdateSpiderDto } from './dto/update-spider.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { BearerGuard } from 'src/auth/guards/bearer.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UseRoles } from 'src/common/decorators/use-roles.decorator';
import { DEFAULT_IMAGE_VALIDATORS } from 'src/common/constants/validations';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { S3Service } from 'src/s3/s3.service';
import { AddMetaToSpider } from './types/add-meta-to-spider.type';
import { getFileNameFromS3Url } from 'src/common/utils/get-file-name-from-s3-url';
import { SpiderEntity } from './entities/spider.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { SpidersPaginationEntity } from 'src/spiders/entities/spiders-pagination.entity';
import { SpiderWithAuthor } from './entities/spider-with-author.entity';

@Controller({ path: 'spiders', version: '1' })
@ApiTags('spiders')
export class SpidersController {
  constructor(
    private readonly spidersService: SpidersService,
    private readonly s3Service: S3Service,
  ) {}

  @Post()
  @UseRoles(UserRole.admin, UserRole.editor)
  @UseGuards(BearerGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new spier. Only for Admin or Editor',
  })
  @ApiResponse({
    description:
      'Response returns an object with information about the new spider',
  })
  @ApiConsumes('multipart/form-data')
  async createSpider(
    @GetUser('sub') authorId: number,
    @Body() dto: CreateSpiderDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: DEFAULT_IMAGE_VALIDATORS,
        fileIsRequired: false,
      }),
    )
    image: Express.Multer.File,
  ): Promise<SpiderEntity> {
    const spider = {
      name: dto.name,
      description: dto.description,
      authorId,
    } as AddMetaToSpider<CreateSpiderDto>;

    if (image) {
      spider.imageUrl = await this.s3Service.uploadFile(image, authorId);
    }

    return this.spidersService.createSpider(spider);
  }

  @Get()
  @ApiOperation({
    summary: 'Get a list of spiders',
  })
  @ApiResponse({
    description: 'Response returns a list of spiders',
  })
  getAllSpiders(
    @Query()
    pagination: PaginationDto,
  ): Promise<SpidersPaginationEntity> {
    return this.spidersService.findAllSpiders(pagination);
  }

  @Get(':spiderId')
  @ApiOperation({
    summary: 'Get a information about the spider',
  })
  @ApiResponse({
    description: 'Response returns an object with information about the spider',
  })
  getSpiderById(
    @Param('spiderId', ParseIntPipe) spiderId: number,
  ): Promise<SpiderWithAuthor | null> {
    return this.spidersService.findSpiderById(spiderId);
  }

  @Patch(':spiderId')
  @UseRoles(UserRole.admin, UserRole.editor)
  @UseGuards(BearerGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Update information about an existing spider. Only for Admin or Editor',
  })
  @ApiResponse({
    description:
      'Response returns an object with information about the updated spider',
  })
  @ApiConsumes('multipart/form-data')
  async updateSpider(
    @GetUser('sub') authorId: number,
    @Param('spiderId', ParseIntPipe) spiderId: number,
    @Body() dto: UpdateSpiderDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: DEFAULT_IMAGE_VALIDATORS,
        fileIsRequired: false,
      }),
    )
    image: Express.Multer.File,
  ): Promise<SpiderEntity> {
    const spider = await this.spidersService.findSpiderById(spiderId);

    if (!spider) {
      throw new NotFoundException('Spider is not found');
    }

    const paramsToUpdate = {
      name: dto.name,
      description: dto.description,
    } as AddMetaToSpider<UpdateSpiderDto>;

    if (image) {
      spider.imageUrl &&
        (await this.s3Service.deleteFile(
          getFileNameFromS3Url(spider.imageUrl),
        ));

      const imageKey = await this.s3Service.uploadFile(image, authorId);

      paramsToUpdate.imageUrl = this.s3Service.getUrlFromCloudFront(imageKey);
    }

    return this.spidersService.updateSpider(spiderId, paramsToUpdate);
  }

  @Delete(':id')
  @UseRoles(UserRole.admin, UserRole.editor)
  @UseGuards(BearerGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete an existing spider. Only for Admin or Editor',
  })
  async removeSpider(
    @Param('spiderId', ParseIntPipe) spiderId: number,
  ): Promise<void> {
    const spider = await this.spidersService.findSpiderById(spiderId);

    if (!spider) {
      throw new NotFoundException('Spider is not found');
    }

    return this.spidersService.removeSpider(spiderId);
  }
}
