import { useEffect, useState } from 'react';
import { getSupabase } from '../storage/supabaseClient';
import { supabaseTaskCatalogRepository, supabaseTaskRepository } from '../storage/supabaseTaskRepository';
import { dateKey } from '../utils/dateUtils';
import { useDiaryLogic } from './useDiaryLogic';
import { useProfileLogic } from './useProfileLogic';
import { useSkillTreeLogic } from './useSkillTreeLogic';
import { useTaskLogic } from './useTaskLogic';

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useAppController() {
  const today = new Date();
  const todayKey = dateKey(today);
  const [authReady, setAuthReady] = useState(false);
  const [databaseReady, setDatabaseReady] = useState(false);
  const [databaseRetry, setDatabaseRetry] = useState(0);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const { data, error } = await getSupabase().auth.getSession();
        if (error) throw error;
        if (data.session?.user.is_anonymous) {
          const { error: signOutError } = await getSupabase().auth.signOut();
          if (signOutError) throw signOutError;
        }
        if (!active) return;

        setDatabaseReady(Boolean(data.session && !data.session.user.is_anonymous));
        setStorageError(null);
      } catch (error) {
        if (active) {
          setStorageError(
            getErrorMessage(error, 'Kirjautumistilan tarkistus epäonnistui.'),
          );
        }
      } finally {
        if (active) setAuthReady(true);
      }
    }

    void restoreSession();

    return () => {
      active = false;
    };
  }, [databaseRetry, todayKey]);

  async function signIn(email: string, password: string): Promise<boolean> {
    setStorageError(null);
    try {
      const { error } = await getSupabase().auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      setDatabaseReady(true);
      return true;
    } catch (error) {
      setStorageError(getErrorMessage(error, 'Kirjautuminen epäonnistui.'));
      return false;
    }
  }

  const onStorageError = setStorageError;
  const tasks = useTaskLogic({
    todayKey,
    databaseReady,
    onStorageError,
    taskRepository: supabaseTaskRepository,
    taskCatalogRepository: supabaseTaskCatalogRepository,
  });
  const diary = useDiaryLogic({
    today,
    databaseReady,
    onStorageError,
  });
  const skillTree = useSkillTreeLogic({
    databaseReady,
    onStorageError,
  });
  const profile = useProfileLogic({ databaseReady, onStorageError });

  function retryDatabase() {
    setStorageError(null);
    setDatabaseReady(false);
    setDatabaseRetry((value) => value + 1);
  }

  return {
    today,
    authReady,
    databaseReady,
    storageError,
    signIn,
    retryDatabase,
    tasks,
    diary,
    skillTree,
    profile: profile.profileData,
    refreshProfile: profile.refreshProfile,
  };
}
