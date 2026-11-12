import { useEffect, useState } from 'react';
import { initializeLocalDatabase } from '../storage/localDatabase';
import type { LocalData } from '../storage/localDatabase';
import { jsonTaskCatalogRepository } from '../storage/jsonTaskCatalogRepository';
import { localTaskRepository } from '../storage/localTaskRepository';
import { dateKey } from '../utils/dateUtils';
import { useDiaryLogic } from './useDiaryLogic';
import { useSkillTreeLogic } from './useSkillTreeLogic';
import { useTaskLogic } from './useTaskLogic';

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useAppController() {
  const today = new Date();
  const todayKey = dateKey(today);
  const [localData, setLocalData] = useState<LocalData | null>(null);
  const [databaseReady, setDatabaseReady] = useState(false);
  const [databaseRetry, setDatabaseRetry] = useState(0);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadLocalData() {
      try {
        const data = await initializeLocalDatabase(todayKey);
        if (!active) return;

        setLocalData(data);
        setDatabaseReady(true);
        setStorageError(null);
      } catch (error) {
        if (active) {
          setStorageError(
            getErrorMessage(error, 'Paikallisen tietokannan avaaminen epäonnistui.'),
          );
        }
      }
    }

    void loadLocalData();
    return () => {
      active = false;
    };
  }, [databaseRetry, todayKey]);

  const onStorageError = setStorageError;
  const tasks = useTaskLogic({
    todayKey,
    databaseReady,
    onStorageError,
    taskRepository: localTaskRepository,
    taskCatalogRepository: jsonTaskCatalogRepository,
  });
  const diary = useDiaryLogic({
    today,
    initialEntries: localData?.entries ?? null,
    databaseReady,
    onStorageError,
  });
  const skillTree = useSkillTreeLogic({
    initialSkills: localData?.skills ?? null,
    databaseReady,
    onStorageError,
  });

  function retryDatabase() {
    setStorageError(null);
    setDatabaseReady(false);
    setLocalData(null);
    setDatabaseRetry((value) => value + 1);
  }

  return {
    today,
    databaseReady,
    storageError,
    retryDatabase,
    tasks,
    diary,
    skillTree,
  };
}
