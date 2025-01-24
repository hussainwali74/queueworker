import { Provider } from '@nestjs/common';
import Redis from 'ioredis';

export const RedisProvider: Provider = {
  provide: 'REDIS_CLIENT',
  useFactory: () => {
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT || 6379),
      password: process.env.REDIS_PASSWORD,
      db: Number(process.env.REDIS_DB || 0),
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      showFriendlyErrorStack: true,
    });

    redis.on('error', (err) => console.error('Redis Client Error', err));
    redis.on('connect', () => console.log('Redis Client Connected'));

    return redis;
  },
};
