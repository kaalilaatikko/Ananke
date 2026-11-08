import { useEffect, useState } from 'react';
import { createTask, updateTaskCompletion } from '../storage/localDatabase';
import type { Task } from '../storage/localDatabase';

type Props = {
  todayKey: string;
  initialTasksByDate: Record<string, Task[]> | null;
  databaseReady: boolean;
  onStorageError: (message: string | null) => void;
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useTaskLogic({
  todayKey,
  initialTasksByDate,
  databaseReady,
  onStorageError,
}: Props) {
  const [tasksByDate, setTasksByDate] = useState<Record<string, Task[]>>({});
  const [taskInput, setTaskInput] = useState('');

  useEffect(() => {
    if (initialTasksByDate) {
      setTasksByDate(initialTasksByDate);
    }
  }, [initialTasksByDate]);

  async function addTask() {
    const title = taskInput.trim();
    if (!title || !databaseReady) return;

    try {
      const task = await createTask(todayKey, title);
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

  async function toggleTask(id: number) {
    const task = (tasksByDate[todayKey] ?? []).find((item) => item.id === id);
    if (!task || !databaseReady) return;
    const done = !task.done;

    try {
      await updateTaskCompletion(id, done);
      setTasksByDate((current) => ({
        ...current,
        [todayKey]: (current[todayKey] ?? []).map((item) =>
          item.id === id ? { ...item, done } : item,
        ),
      }));
      onStorageError(null);
    } catch (error) {
      onStorageError(
        getErrorMessage(error, 'Tehtävän tilan tallennus epäonnistui.'),
      );
    }
  }

  return {
    dailyTasks: tasksByDate[todayKey] ?? [],
    taskInput,
    setTaskInput,
    addTask,
    toggleTask,
  };
}
