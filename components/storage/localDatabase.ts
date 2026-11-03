import * as SQLite from 'expo-sqlite';
import type { NewSkill, Skill } from './skillRepository';

export type Task = {
  id: number;
  title: string;
  done: boolean;
};

export type DiaryEntry = {
  thoughts: string;
  rating: number | null;
};

export type LocalData = {
  tasksByDate: Record<string, Task[]>;
  entries: Record<string, DiaryEntry>;
  skills: Skill[];
};

type TaskRow = {
  id: number;
  date: string;
  title: string;
  done: number;
};

type DiaryEntryRow = {
  date: string;
  thoughts: string;
  rating: number | null;
};

type MetaRow = {
  value: string;
};

type SkillRow = {
  id: number;
  parent_id: number | null;
  name: string;
  notes: string;
};

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync('ananke.db');
  }
  try {
    return await databasePromise;
  } catch (error) {
    databasePromise = null;
    throw error;
  }
}

async function insertDefaultSkills(database: SQLite.SQLiteDatabase): Promise<void> {
  const root = await database.runAsync(
    'INSERT INTO skills (parent_id, name, notes) VALUES (?, ?, ?)',
    null,
    'Koulu',
    'Kouluun liittyvät taidot',
  );
  const subject = await database.runAsync(
    'INSERT INTO skills (parent_id, name, notes) VALUES (?, ?, ?)',
    root.lastInsertRowId,
    'Matikka',
    'Matikkaan liittyvät taidot esim. eri laskukaavat',
  );
  await database.runAsync(
    'INSERT INTO skills (parent_id, name, notes) VALUES (?, ?, ?)',
    subject.lastInsertRowId,
    'Kertolaskut',
    'Kertolaskussa luku kerrotaan toisella luvulla ja tästä saadaan vastaukseksi tulo',
  );
}

export async function initializeLocalDatabase(today: string): Promise<LocalData> {
  const database = await getDatabase();

  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS tasks_date_idx ON tasks(date);
    CREATE TABLE IF NOT EXISTS diary_entries (
      date TEXT PRIMARY KEY NOT NULL,
      thoughts TEXT NOT NULL DEFAULT '',
      rating INTEGER
    );
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT ''
    );
    CREATE INDEX IF NOT EXISTS skills_parent_id_idx ON skills(parent_id);
  `);

  const seeded = await database.getFirstAsync<MetaRow>(
    'SELECT value FROM app_meta WHERE key = ?',
    'initial_tasks_seeded',
  );

  if (!seeded) {
    await database.withTransactionAsync(async () => {
      const currentSeed = await database.getFirstAsync<MetaRow>(
        'SELECT value FROM app_meta WHERE key = ?',
        'initial_tasks_seeded',
      );

      if (!currentSeed) {
        await database.runAsync(
          'INSERT INTO tasks (date, title, done) VALUES (?, ?, ?)',
          today,
          'Opiskelu',
          0,
        );
        await database.runAsync(
          'INSERT INTO tasks (date, title, done) VALUES (?, ?, ?)',
          today,
          'Lenkki',
          0,
        );
        await database.runAsync(
          'INSERT INTO tasks (date, title, done) VALUES (?, ?, ?)',
          today,
          'Lue 20 minuuttia',
          0,
        );
        await database.runAsync(
          'INSERT INTO app_meta (key, value) VALUES (?, ?)',
          'initial_tasks_seeded',
          '1',
        );
      }
    });
  }

  const skillsSeeded = await database.getFirstAsync<MetaRow>(
    'SELECT value FROM app_meta WHERE key = ?',
    'initial_skills_seeded',
  );

  if (!skillsSeeded) {
    await database.withTransactionAsync(async () => {
      const currentSeed = await database.getFirstAsync<MetaRow>(
        'SELECT value FROM app_meta WHERE key = ?',
        'initial_skills_seeded',
      );

      if (!currentSeed) {
        await insertDefaultSkills(database);
        await database.runAsync(
          'INSERT INTO app_meta (key, value) VALUES (?, ?)',
          'initial_skills_seeded',
          '1',
        );
      }
    });
  }

  const taskRows = await database.getAllAsync<TaskRow>(
    'SELECT id, date, title, done FROM tasks ORDER BY id',
  );
  const entryRows = await database.getAllAsync<DiaryEntryRow>(
    'SELECT date, thoughts, rating FROM diary_entries',
  );
  const skills = await loadSkills();
  const tasksByDate: Record<string, Task[]> = {};
  const entries: Record<string, DiaryEntry> = {};

  for (const row of taskRows) {
    const tasks = tasksByDate[row.date] ?? [];
    tasks.push({ id: row.id, title: row.title, done: row.done === 1 });
    tasksByDate[row.date] = tasks;
  }

  for (const row of entryRows) {
    entries[row.date] = { thoughts: row.thoughts, rating: row.rating };
  }

  return { tasksByDate, entries, skills };
}

export async function loadSkills(): Promise<Skill[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<SkillRow>(
    'SELECT id, parent_id, name, notes FROM skills ORDER BY id',
  );

  return rows.map((row) => ({
    id: row.id,
    parentId: row.parent_id,
    name: row.name,
    notes: row.notes,
  }));
}

export async function createSkill(input: NewSkill): Promise<Skill> {
  const database = await getDatabase();
  const result = await database.runAsync(
    'INSERT INTO skills (parent_id, name, notes) VALUES (?, ?, ?)',
    input.parentId,
    input.name,
    input.notes,
  );

  return { id: result.lastInsertRowId, ...input };
}

export async function resetSkills(): Promise<Skill[]> {
  const database = await getDatabase();

  await database.withTransactionAsync(async () => {
    await database.runAsync('DELETE FROM skills');
    await insertDefaultSkills(database);
  });

  return loadSkills();
}

export async function createTask(date: string, title: string): Promise<Task> {
  const database = await getDatabase();
  const result = await database.runAsync(
    'INSERT INTO tasks (date, title, done) VALUES (?, ?, ?)',
    date,
    title,
    0,
  );

  return { id: result.lastInsertRowId, title, done: false };
}

export async function updateTaskCompletion(id: number, done: boolean): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('UPDATE tasks SET done = ? WHERE id = ?', done ? 1 : 0, id);
}

export async function saveDiaryEntry(
  date: string,
  entry: DiaryEntry,
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO diary_entries (date, thoughts, rating)
     VALUES (?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET
       thoughts = excluded.thoughts,
       rating = excluded.rating`,
    date,
    entry.thoughts,
    entry.rating,
  );
}
