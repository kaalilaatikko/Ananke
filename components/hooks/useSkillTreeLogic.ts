import { useEffect, useState } from 'react';
import { supabaseSkillRepository } from '../storage/supabaseSkillRepository';
import type { NewSkill, Skill } from '../storage/skillRepository';

type Props = {
  databaseReady: boolean;
  onStorageError: (message: string | null) => void;
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useSkillTreeLogic({
  databaseReady,
  onStorageError,
}: Props) {
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    if (!databaseReady) return;
    let active = true;

    supabaseSkillRepository
      .list()
      .then((loadedSkills) => {
        if (active) setSkills(loadedSkills);
      })
      .catch((error: unknown) => {
        if (active) {
          onStorageError(getErrorMessage(error, 'Taitojen lataaminen epäonnistui.'));
        }
      });

    return () => {
      active = false;
    };
  }, [databaseReady, onStorageError]);

  async function addSkill(skill: NewSkill): Promise<boolean> {
    if (!databaseReady) return false;

    try {
      const createdSkill = await supabaseSkillRepository.create(skill);
      setSkills((current) => [...current, createdSkill]);
      onStorageError(null);
      return true;
    } catch (error) {
      onStorageError(getErrorMessage(error, 'Taidon tallennus epäonnistui.'));
      return false;
    }
  }

  async function resetSkills(): Promise<boolean> {
    if (!databaseReady) return false;

    try {
      setSkills(await supabaseSkillRepository.reset());
      onStorageError(null);
      return true;
    } catch (error) {
      onStorageError(getErrorMessage(error, 'Taitopuun palautus epäonnistui.'));
      return false;
    }
  }

  return { skills, addSkill, resetSkills };
}
