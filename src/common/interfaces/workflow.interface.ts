import { WorkflowStatus } from '../enums/workflow-status.enum';
import { Task } from './task.interface';

export interface Workflow {
  id: string;
  name: string;
  version: string;
  tasks: Task[];
  status: WorkflowStatus;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
