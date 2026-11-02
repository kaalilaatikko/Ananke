import * as SQLite from 'expo-sqlite';

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

export async function initializeLocalDatabase(today: string): Promise<LocalData> {
  const database = await getDatabase();

  await database.execAsync(`
    PRAGMA journal_mode = WAL;
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

  const taskRows = await database.getAllAsync<TaskRow>(
    'SELECT id, date, title, done FROM tasks ORDER BY id',
  );
  const entryRows = await database.getAllAsync<DiaryEntryRow>(
    'SELECT date, thoughts, rating FROM diary_entries',
  );
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

  return { tasksByDate, entries };
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
