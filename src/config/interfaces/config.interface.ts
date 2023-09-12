import { Aws } from './aws.interface';
import { Mailer } from './mailer.interface';
import { TokenOptions } from './token-options.interface';

export interface Config {
  databaseUrl: string;
  redisUrl: string;
  frontendUrl: string;
  tokenOptions: TokenOptions;
  mailer: Mailer;
  aws: Aws;
}
