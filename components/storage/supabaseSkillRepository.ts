import { getSupabase } from './supabaseClient';
import type { NewSkill, Skill, SkillRepository } from './skillRepository';

type SkillRow = {
  id: number;
  parent_id: number | null;
  name: string;
  notes: string;
};

function mapSkill(row: SkillRow): Skill {
  return {
    id: Number(row.id),
    parentId: row.parent_id === null ? null : Number(row.parent_id),
    name: row.name,
    notes: row.notes,
  };
}

export const supabaseSkillRepository: SkillRepository = {
  async list() {
    const { data, error } = await getSupabase()
      .from('skills')
      .select('id, parent_id, name, notes')
      .order('id');

    if (error) throw error;
    return data.map(mapSkill);
  },

  async create(skill: NewSkill) {
    const { data, error } = await getSupabase()
      .from('skills')
      .insert({
        parent_id: skill.parentId,
        name: skill.name,
        notes: skill.notes,
      })
      .select('id, parent_id, name, notes')
      .single();

    if (error) throw error;
    return mapSkill(data);
  },

  async reset() {
    const { error } = await getSupabase().from('skills').delete().gte('id', 0);
    if (error) throw error;
    return [];
  },
};
