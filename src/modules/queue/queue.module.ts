import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueHandler } from './queue.handler';
import { RedisRepository } from './redis.repository';
import { RedisProvider } from './redis.provider';

@Module({
  providers: [RedisProvider, RedisRepository, QueueService, QueueHandler],
  exports: [QueueService],
})
export class QueueModule {}
