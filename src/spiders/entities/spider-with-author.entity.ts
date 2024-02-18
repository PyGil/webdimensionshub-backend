import { SpiderEntity } from './spider.entity';
import { UserEntity } from 'src/users/entities/user.entity';

export class SpiderWithAuthor extends SpiderEntity {
  author: UserEntity;
}
