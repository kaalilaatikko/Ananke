import { getSupabase } from './supabaseClient';
import type {
  NewTask,
  Task,
  TaskCatalogRepository,
  TaskRepository,
  TaskTemplate,
} from './taskRepository';

type TaskRow = {
  id: number;
  template_id: string | null;
  title: string;
  description: string;
  duration_minutes: number;
  xp: number;
  task_class: string;
  done: boolean;
};

function mapTask(row: TaskRow): Task {
  return {
    id: Number(row.id),
    templateId: row.template_id,
    title: row.title,
    description: row.description,
    durationMinutes: row.duration_minutes,
    xp: row.xp,
    class: row.task_class,
    done: row.done,
  };
}

export const supabaseTaskRepository: TaskRepository = {
  async listForDate(date) {
    const { data, error } = await getSupabase()
      .from('tasks')
      .select('id, template_id, title, description, duration_minutes, xp, task_class, done')
      .eq('date', date)
      .order('id');

    if (error) throw error;
    return data.map(mapTask);
  },

  async create(date: string, task: NewTask) {
    const { data, error } = await getSupabase()
      .from('tasks')
      .insert({
        date,
        template_id: task.templateId,
        title: task.title,
        description: task.description,
        duration_minutes: task.durationMinutes,
        xp: task.xp,
        task_class: task.class,
      })
      .select('id, template_id, title, description, duration_minutes, xp, task_class, done')
      .single();

    if (error) throw error;
    return mapTask(data);
  },

  async updateCompletion(id, done) {
    const { error } = await getSupabase().from('tasks').update({ done }).eq('id', id);
    if (error) throw error;
  },
};

export const supabaseTaskCatalogRepository: TaskCatalogRepository = {
  async list() {
    const { data, error } = await getSupabase()
      .from('task_templates')
      .select('id, title, description, duration_minutes, xp, task_class')
      .order('sort_order');

    if (error) throw error;
    return data.map(
      (row): TaskTemplate => ({
        id: row.id,
        title: row.title,
        description: row.description,
        durationMinutes: row.duration_minutes,
        xp: row.xp,
        class: row.task_class,
      }),
    );
  },
};
