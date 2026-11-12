import taskData from '../../data/tasks.json';
import type { TaskCatalogRepository } from './taskRepository';

export const jsonTaskCatalogRepository: TaskCatalogRepository = {
  async list() {
    return taskData.tasks;
  },
};
