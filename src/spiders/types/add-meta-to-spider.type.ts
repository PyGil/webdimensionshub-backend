import { Spider } from '@prisma/client';

export type AddMetaToSpider<T extends Partial<Spider>> = Omit<T, 'image'> & {
  imageUrl?: string;
  authorId: number;
};
