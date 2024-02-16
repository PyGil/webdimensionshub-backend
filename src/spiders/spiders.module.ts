import { Module } from '@nestjs/common';
import { SpidersService } from './spiders.service';
import { SpidersController } from './spiders.controller';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports: [S3Module],
  controllers: [SpidersController],
  providers: [SpidersService],
})
export class SpidersModule {}
