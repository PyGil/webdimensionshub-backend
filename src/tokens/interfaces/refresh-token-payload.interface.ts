import { TokenPayload } from './token-payload.interface';

export interface RefreshTokenPayload extends TokenPayload {
  accessToken: string;
}
