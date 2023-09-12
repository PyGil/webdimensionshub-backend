import { FactoryProvider, LoggerService } from '@nestjs/common';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';

import { RedisClient, REDIS_CLIENT } from './redis-client.type';

export const redisClientFactory: FactoryProvider<Promise<RedisClient>> = {
  provide: REDIS_CLIENT,
  inject: [ConfigService],
  useFactory: async (
    configService: ConfigService,
    loggerService: LoggerService,
  ) => {
    const client = createClient({ url: configService.get<string>('redisUrl') });
    await client.connect();

    client.on('connect', () =>
      loggerService.log('Redis successfully connected'),
    );
    client.on('error', (error: Error) => loggerService.error(error));

    return client;
  },
};
