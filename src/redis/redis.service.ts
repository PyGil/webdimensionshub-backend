import { Inject, Injectable } from '@nestjs/common';
import { RedisClient, REDIS_CLIENT } from './redis-client.type';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: RedisClient) {}

  get(key: string): Promise<string> {
    return this.redis.get(key);
  }

  set(key: string, value: string, expireIn?: number): Promise<string> {
    return this.redis.set(key, value, { EX: expireIn });
  }

  setObject(key: string, object: object, expireIn?: number): Promise<string> {
    return this.set(key, JSON.stringify(object), expireIn);
  }

  async getObject<T>(key: string): Promise<T> {
    return JSON.parse(await this.get(key));
  }

  delete(...keys: string[]): Promise<number> {
    return this.redis.del(keys);
  }

  lPush(key: string, value: string): Promise<number> {
    return this.redis.lPush(key, value);
  }

  lRem(key: string, count: number, value: string): Promise<number> {
    return this.redis.lRem(key, count, value);
  }

  lRemAll(key: string, value: string): Promise<number> {
    return this.redis.lRem(key, 0, value);
  }

  lRange(
    key: string,
    startIndex: number,
    stopIndex: number,
  ): Promise<string[]> {
    return this.redis.lRange(key, startIndex, stopIndex);
  }

  lRangeAll(key: string): Promise<string[]> {
    return this.redis.lRange(key, 0, -1);
  }
}
