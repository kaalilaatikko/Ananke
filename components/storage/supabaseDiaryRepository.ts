import { getSupabase } from './supabaseClient';

export type DiaryEntry = {
  thoughts: string;
  rating: number | null;
};

export type DiaryRepository = {
  list(): Promise<Record<string, DiaryEntry>>;
  save(date: string, entry: DiaryEntry): Promise<void>;
};

export const supabaseDiaryRepository: DiaryRepository = {
  async list() {
    const { data, error } = await getSupabase()
      .from('diary_entries')
      .select('date, thoughts, rating')
      .order('date');

    if (error) throw error;

    return Object.fromEntries(
      data.map((row) => [row.date, { thoughts: row.thoughts, rating: row.rating }]),
    );
  },

  async save(date, entry) {
    const { error } = await getSupabase().from('diary_entries').upsert(
      {
        date,
        thoughts: entry.thoughts,
        rating: entry.rating,
      },
      { onConflict: 'user_id,date' },
    );

    if (error) throw error;
  },
};
