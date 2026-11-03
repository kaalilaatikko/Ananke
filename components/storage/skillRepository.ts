export type Skill = {
  id: number;
  parentId: number | null;
  name: string;
  notes: string;
};

export type NewSkill = {
  parentId: number | null;
  name: string;
  notes: string;
};

export interface SkillRepository {
  list(): Promise<Skill[]>;
  create(skill: NewSkill): Promise<Skill>;
  reset(): Promise<Skill[]>;
}
