import { TaskStatus } from '../enums/task-status.enum';

export interface Task {
  id: string;
  type: string;
  status: TaskStatus;
  priority: number;
  data: Record<string, any>;
  retryCount: number;
  maxRetries: number;
  workflowId?: string;
  dependencies?: string[];
  createdAt: Date;
  updatedAt: Date;
  scheduledFor?: Date;
}
