import { useEffect, useRef, useState } from 'react';
import type {
  Task,
  TaskCatalogRepository,
  TaskRepository,
  TaskTemplate,
} from '../storage/taskRepository';

type Props = {
  todayKey: string;
  databaseReady: boolean;
  onStorageError: (message: string | null) => void;
  taskRepository: TaskRepository;
  taskCatalogRepository: TaskCatalogRepository;
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useTaskLogic({
  todayKey,
  databaseReady,
  onStorageError,
  taskRepository,
  taskCatalogRepository,
}: Props) {
  const [tasksByDate, setTasksByDate] = useState<Record<string, Task[]>>({});
  const [taskCatalog, setTaskCatalog] = useState<TaskTemplate[]>([]);
  const [pendingTemplateIds, setPendingTemplateIds] = useState<string[]>([]);
  const pendingTemplateIdsRef = useRef(new Set<string>());
  const [taskInput, setTaskInput] = useState('');

  useEffect(() => {
    if (!databaseReady) return;
    let active = true;

    taskRepository
      .listForDate(todayKey)
      .then((tasks) => {
        if (active) {
          setTasksByDate((current) => ({ ...current, [todayKey]: tasks }));
        }
      })
      .catch((error: unknown) => {
        if (active) {
          onStorageError(getErrorMessage(error, 'Tehtävien lataaminen epäonnistui.'));
        }
      });

    return () => {
      active = false;
    };
  }, [databaseReady, onStorageError, taskRepository, todayKey]);

  useEffect(() => {
    if (!databaseReady) return;
    let active = true;

    taskCatalogRepository
      .list()
      .then((catalog) => {
        if (active) setTaskCatalog(catalog);
      })
      .catch((error: unknown) => {
        if (active) {
          onStorageError(getErrorMessage(error, 'Tehtävälistan lataaminen epäonnistui.'));
        }
      });

    return () => {
      active = false;
    };
  }, [databaseReady, onStorageError, taskCatalogRepository]);

  async function addTask() {
    const title = taskInput.trim();
    if (!title || !databaseReady) return;

    try {
      const task = await taskRepository.create(todayKey, {
        templateId: null,
        title,
        description: '',
        durationMinutes: 0,
        xp: 0,
        class: 'custom',
      });
      setTasksByDate((current) => ({
        ...current,
        [todayKey]: [...(current[todayKey] ?? []), task],
      }));
      setTaskInput('');
      onStorageError(null);
    } catch (error) {
      onStorageError(getErrorMessage(error, 'Tehtävän tallennus epäonnistui.'));
    }
  }

  async function addTemplateTask(templateId: string) {
    const template = taskCatalog.find((item) => item.id === templateId);
    if (!template || !databaseReady || pendingTemplateIdsRef.current.has(templateId)) return;

    const todayTasks = tasksByDate[todayKey] ?? [];
    if (todayTasks.some((task) => task.templateId === templateId)) return;

    pendingTemplateIdsRef.current.add(templateId);
    setPendingTemplateIds((current) => [...current, templateId]);

    try {
      const task = await taskRepository.create(todayKey, {
        templateId: template.id,
        title: template.title,
        description: template.description,
        durationMinutes: template.durationMinutes,
        xp: template.xp,
        class: template.class,
      });
      setTasksByDate((current) => ({
        ...current,
        [todayKey]: [...(current[todayKey] ?? []), task],
      }));
      onStorageError(null);
    } catch (error) {
      onStorageError(getErrorMessage(error, 'Tehtävän lisääminen epäonnistui.'));
    } finally {
      pendingTemplateIdsRef.current.delete(templateId);
      setPendingTemplateIds((current) => current.filter((id) => id !== templateId));
    }
  }

  async function toggleTask(id: number) {
    const task = (tasksByDate[todayKey] ?? []).find((item) => item.id === id);
    if (!task || !databaseReady) return;
    const done = !task.done;

    try {
      await taskRepository.updateCompletion(id, done);
      setTasksByDate((current) => ({
        ...current,
        [todayKey]: (current[todayKey] ?? []).map((item) =>
          item.id === id ? { ...item, done } : item,
        ),
      }));
      onStorageError(null);
      return true;
    } catch (error) {
      onStorageError(
        getErrorMessage(error, 'Tehtävän tilan tallennus epäonnistui.'),
      );
      return false;
    }
  }

  return {
    dailyTasks: tasksByDate[todayKey] ?? [],
    availableTemplates: taskCatalog.filter(
      (template) =>
        !pendingTemplateIds.includes(template.id) &&
        !(tasksByDate[todayKey] ?? []).some((task) => task.templateId === template.id),
    ),
    taskInput,
    setTaskInput,
    addTask,
    addTemplateTask,
    toggleTask,
  };
}
