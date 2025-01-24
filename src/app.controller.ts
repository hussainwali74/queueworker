/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Controller, Post, Body, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { QueueService } from './modules/queue/queue.service';
import { v4 as uuidv4 } from 'uuid';
import { TaskStatus } from './common/enums/task-status.enum';
import { Task } from './common/interfaces/task.interface';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly queueService: QueueService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('task')
  async createTask(@Body() taskData: Task) {
    const task = {
      id: uuidv4(),
      type: 'TEST_TASK',
      status: TaskStatus.PENDING,
      priority: 1,
      data: taskData,
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.queueService.pushTask(task);
    return { taskId: task.id };
  }

  @Get('next-task')
  async getNextTask() {
    console.log('getNextTask-->controller');
    const task = await this.queueService.getNextTask();
    return task;
  }

  @Get('health')
  async checkHealth() {
    try {
      await this.queueService.getNextTask().catch();
      return { status: 'healthy', redis: 'connected' };
    } catch (error: any) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}
