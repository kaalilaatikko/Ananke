import { useEffect, useState } from 'react';
import { localSkillRepository } from '../storage/localSkillRepository';
import type { NewSkill, Skill } from '../storage/skillRepository';

type Props = {
  initialSkills: Skill[] | null;
  databaseReady: boolean;
  onStorageError: (message: string | null) => void;
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useSkillTreeLogic({
  initialSkills,
  databaseReady,
  onStorageError,
}: Props) {
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    if (initialSkills) {
      setSkills(initialSkills);
    }
  }, [initialSkills]);

  async function addSkill(skill: NewSkill): Promise<boolean> {
    if (!databaseReady) return false;

    try {
      const createdSkill = await localSkillRepository.create(skill);
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
      setSkills(await localSkillRepository.reset());
      onStorageError(null);
      return true;
    } catch (error) {
      onStorageError(getErrorMessage(error, 'Taitopuun palautus epäonnistui.'));
      return false;
    }
  }

  return { skills, addSkill, resetSkills };
}
