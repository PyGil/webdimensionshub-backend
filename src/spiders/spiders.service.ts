import { Injectable } from '@nestjs/common';

import { CreateSpiderDto } from './dto/create-spider.dto';
import { UpdateSpiderDto } from './dto/update-spider.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { S3Service } from 'src/s3/s3.service';
import { getFileNameFromS3Url } from 'src/common/utils/get-file-name-from-s3-url';
import { AddMetaToSpider } from './types/add-meta-to-spider.type';
import { SpiderEntity } from './entities/spider.entity';

@Injectable()
export class SpidersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  createSpider(dto: AddMetaToSpider<CreateSpiderDto>): Promise<SpiderEntity> {
    return this.prisma.spider.create({ data: dto });
  }

  findAllSpiders(): Promise<SpiderEntity[]> {
    return this.prisma.spider.findMany();
  }

  findSpiderById(spiderId: number): Promise<SpiderEntity> {
    return this.prisma.spider.findUnique({
      where: { id: spiderId },
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

    await this.prisma.user.delete({ where: { id: spider.id } });
  }
}
