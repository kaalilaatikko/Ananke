export type TaskTemplate = {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  xp: number;
  class: string;
};

export type Task = {
  id: number;
  templateId: string | null;
  title: string;
  description: string;
  durationMinutes: number;
  xp: number;
  class: string;
  done: boolean;
};

export type NewTask = Omit<Task, 'id' | 'done'>;

export interface TaskRepository {
  listForDate(date: string): Promise<Task[]>;
  create(date: string, task: NewTask): Promise<Task>;
  updateCompletion(id: number, done: boolean): Promise<void>;
}

export interface TaskCatalogRepository {
  list(): Promise<TaskTemplate[]>;
}
