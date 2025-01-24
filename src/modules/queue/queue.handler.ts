import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, EventPattern } from '@nestjs/microservices';
import { Task } from '../../common/interfaces/task.interface';

@Controller()
export class QueueHandler {
  private readonly logger = new Logger(QueueHandler.name);
  private taskStore: Map<string, Task> = new Map();
  private taskQueue: Map<string, string[]> = new Map();

  @MessagePattern('queue_worker.task.store')
  handleTaskStore({ id, data }: { id: string; data: Task }) {
    this.taskStore.set(id, data);
    this.logger.debug(`Stored task ${id}`);
    return { success: true };
  }

  @MessagePattern('queue_worker.task.get')
  handleTaskGet({ id }: { id: string }) {
    const task = this.taskStore.get(id);
    this.logger.debug(`Retrieved task ${id}: ${task ? 'found' : 'not found'}`);
    return task || null;
  }

  @MessagePattern('queue_worker.queue.push')
  handleQueuePush({
    queue,
    id,
  }: {
    queue: string;
    id: string;
    priority: number;
  }) {
    let queueItems = this.taskQueue.get(queue);
    if (!queueItems) {
      queueItems = [];
      this.taskQueue.set(queue, queueItems);
    }
    queueItems.push(id);
    this.logger.debug(`Pushed task ${id} to queue ${queue}`);
    return { success: true };
  }

  @MessagePattern('queue_worker.queue.pop')
  handleQueuePop({ queue }: { queue: string }) {
    const queueItems = this.taskQueue.get(queue) || [];
    if (queueItems.length === 0) {
      this.logger.debug(`No tasks in queue ${queue}`);
      return null;
    }
    const id = queueItems.shift();
    this.logger.debug(`Popped task ${id} from queue ${queue}`);
    return { id };
  }

  @EventPattern('queue_worker.task.queued')
  handleTaskQueued(task: Task) {
    this.logger.log(`Task queued: ${task.id}`);
  }

  @EventPattern('queue_worker.task.processing')
  handleTaskProcessing(task: Task) {
    this.logger.log(`Task processing: ${task.id}`);
  }

  @EventPattern('queue_worker.task.status_updated')
  handleTaskStatusUpdated({
    id,
    status,
  }: {
    id: string;
    status: string;
    updatedAt: Date;
  }) {
    this.logger.log(`Task ${id} status updated to ${status}`);
  }
}
