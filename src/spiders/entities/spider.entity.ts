import { Spider } from '@prisma/client';

export class SpiderEntity implements Spider {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description: string;
  authorId: number;
  imageUrl: string;
}
