import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { Aws } from 'src/config/interfaces/aws.interface';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getFileExtension } from 'src/common/utils/default-parse-int copy';

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucked: string;
  private readonly cloudfrontUrl: string;

  constructor(private readonly configService: ConfigService) {
    const awsConfig = this.configService.get<Aws>('aws');

    this.client = new S3Client({
      region: awsConfig.s3.region,
      credentials: {
        accessKeyId: awsConfig.accessKeyId,
        secretAccessKey: awsConfig.secret,
      },
    });

    this.bucked = awsConfig.s3.bucked;
    this.cloudfrontUrl = awsConfig.cloudfrontUrl;
  }

  getUrlFromCloudFront(fileName: string): string {
    return `${this.cloudfrontUrl}/${fileName}`;
  }

  async getFile(fileName: string): Promise<string> {
    const command = new GetObjectCommand({
      Key: fileName,
      Bucket: this.bucked,
    });

    return getSignedUrl(this.client, command);
  }

  async uploadFile(file: Express.Multer.File, userId: number): Promise<string> {
    const fileExtension = getFileExtension(file.originalname);
    const Key = `${userId}-${new Date().getTime()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Key,
      Bucket: this.bucked,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.client.send(command);

    return Key;
  }

  async deleteFile(filename: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucked,
      Key: filename,
    });

    await this.client.send(command);
  }
}
