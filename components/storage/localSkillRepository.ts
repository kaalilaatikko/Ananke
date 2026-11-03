import { createSkill, loadSkills, resetSkills } from './localDatabase';
import type { SkillRepository } from './skillRepository';

export const localSkillRepository: SkillRepository = {
  list: loadSkills,
  create: createSkill,
  reset: resetSkills,
};
