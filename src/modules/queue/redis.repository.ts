import { Injectable, OnModuleDestroy, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisRepository implements OnModuleDestroy {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  onModuleDestroy() {
    this.redis.disconnect();
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.set(key, value, 'EX', ttl);
    } else {
      await this.redis.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async lpush(key: string, value: string): Promise<void> {
    await this.redis.lpush(key, value);
  }

  async rpop(key: string): Promise<string | null> {
    return this.redis.rpop(key);
  }
}
