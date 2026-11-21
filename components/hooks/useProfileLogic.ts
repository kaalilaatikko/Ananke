import { useCallback, useEffect, useState } from 'react';
import { loadProfile } from '../storage/profileRepository';
import type { ProfileData } from '../storage/profileRepository';

type Props = {
  databaseReady: boolean;
  onStorageError: (message: string | null) => void;
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useProfileLogic({ databaseReady, onStorageError }: Props) {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  const refreshProfile = useCallback(async () => {
    try {
      setProfileData(await loadProfile());
      onStorageError(null);
    } catch (error) {
      onStorageError(
        getErrorMessage(error, 'Profiilin lataaminen Supabasesta epäonnistui.'),
      );
    }
  }, [onStorageError]);

  useEffect(() => {
    if (!databaseReady) return;
    let active = true;

    loadProfile()
      .then((data) => {
        if (active) setProfileData(data);
      })
      .catch((error: unknown) => {
        if (active) {
          onStorageError(
            getErrorMessage(error, 'Profiilin lataaminen Supabasesta epäonnistui.'),
          );
        }
      });

    return () => {
      active = false;
    };
  }, [databaseReady, onStorageError]);

  return { profileData, refreshProfile };
}
