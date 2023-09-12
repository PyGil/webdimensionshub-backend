import { UserEntity } from 'src/users/entities/user.entity';
import { SessionEntity } from './session.entity';

export class UserSessionEntity {
  user: UserEntity;
  session: SessionEntity;
}
