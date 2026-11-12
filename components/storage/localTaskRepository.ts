import {
  createTask,
  listTasksForDate,
  updateTaskCompletion,
} from './localDatabase';
import type { NewTask, TaskRepository } from './taskRepository';

export const localTaskRepository: TaskRepository = {
  listForDate: listTasksForDate,
  create: (date: string, task: NewTask) => createTask(date, task),
  updateCompletion: updateTaskCompletion,
};
