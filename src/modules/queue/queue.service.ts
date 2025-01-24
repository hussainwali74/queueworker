import { Injectable, Logger } from '@nestjs/common';
import { TaskStatus } from '../../common/enums/task-status.enum';
import { Task } from '../../common/interfaces/task.interface';
import { RedisRepository } from './redis.repository';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  private readonly TASK_PREFIX = 'task:';
  private readonly QUEUE_KEY = 'tasks:queue';

  constructor(private readonly redisRepository: RedisRepository) {}

  async pushTask(task: Task): Promise<void> {
    console.log('pushTask', task);
    try {
      this.logger.log(`Pushing task ${task.id} to queue`);
      task.status = TaskStatus.QUEUED;
      task.updatedAt = new Date();

      // Store task data
      await this.redisRepository.set(
        `${this.TASK_PREFIX}${task.id}`,
        JSON.stringify(task),
      );

      // Add to queue
      await this.redisRepository.lpush(this.QUEUE_KEY, task.id);

      this.logger.log(`Successfully pushed task ${task.id} to queue`);
    } catch (error) {
      this.logger.error(`Failed to push task ${task.id}`, error);
      throw error;
    }
  }

  async getNextTask(): Promise<Task | null> {
    try {
      this.logger.log('Getting next task from queue');

      // Get next task ID from queue
      const taskId = await this.redisRepository.rpop(this.QUEUE_KEY);

      if (!taskId) {
        this.logger.debug('No tasks in queue');
        return null;
      }

      // Get task data
      const taskData = await this.redisRepository.get(
        `${this.TASK_PREFIX}${taskId}`,
      );

      if (!taskData) {
        this.logger.warn(`Task ${taskId} not found in storage`);
        return null;
      }

      const task = JSON.parse(taskData) as Task;
      task.status = TaskStatus.PROCESSING;
      task.updatedAt = new Date();

      // Update task status
      await this.redisRepository.set(
        `${this.TASK_PREFIX}${task.id}`,
        JSON.stringify(task),
      );

      return task;
    } catch (error) {
      this.logger.error('Failed to get next task', error);
      return null;
    }
  }

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
    try {
      const taskData = await this.redisRepository.get(
        `${this.TASK_PREFIX}${taskId}`,
      );
      if (!taskData) {
        throw new Error(`Task ${taskId} not found`);
      }

      const task = JSON.parse(taskData) as Task;
      task.status = status;
      task.updatedAt = new Date();

      await this.redisRepository.set(
        `${this.TASK_PREFIX}${taskId}`,
        JSON.stringify(task),
      );
    } catch (error) {
      this.logger.error(`Failed to update task status ${taskId}`, error);
      throw error;
    }
  }
}
