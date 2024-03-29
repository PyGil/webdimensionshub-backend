import { Injectable } from '@nestjs/common';

import { CreateSpiderDto } from './dto/create-spider.dto';
import { UpdateSpiderDto } from './dto/update-spider.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { S3Service } from 'src/s3/s3.service';
import { getFileNameFromS3Url } from 'src/common/utils/get-file-name-from-s3-url';
import { AddMetaToSpider } from './types/add-meta-to-spider.type';
import { SpiderEntity } from './entities/spider.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { SpidersPaginationEntity } from 'src/spiders/entities/spiders-pagination.entity';
import { DEFAULT_USER_SCOPE } from 'src/users/constants/default-user-scope';
import { SpiderWithAuthor } from './entities/spider-with-author.entity';

@Injectable()
export class SpidersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  createSpider(dto: AddMetaToSpider<CreateSpiderDto>): Promise<SpiderEntity> {
    return this.prisma.spider.create({ data: dto });
  }

  async findAllSpiders(
    pagination: PaginationDto,
  ): Promise<SpidersPaginationEntity> {
    const [count, spiders] = await this.prisma.$transaction([
      this.prisma.spider.count(),
      this.prisma.spider.findMany({
        skip: pagination.offset,
        take: pagination.limit,
      }),
    ]);

    return new SpidersPaginationEntity(spiders, pagination, count);
  }

  findSpiderById(spiderId: number): Promise<SpiderWithAuthor> {
    return this.prisma.spider.findUnique({
      where: { id: spiderId },
      include: { author: { select: DEFAULT_USER_SCOPE } },
    });
  }

  updateSpider(
    spiderId: number,
    dto: AddMetaToSpider<UpdateSpiderDto>,
  ): Promise<SpiderEntity | null> {
    return this.prisma.spider.update({
      where: {
        id: spiderId,
      },
      data: dto,
    });
  }

  async removeSpider(spiderId: number): Promise<void> {
    const spider = await this.findSpiderById(spiderId);

    if (spider.imageUrl) {
      await this.s3Service.deleteFile(getFileNameFromS3Url(spider.imageUrl));
    }

    await this.prisma.spider.delete({ where: { id: spiderId } });
  }
}
