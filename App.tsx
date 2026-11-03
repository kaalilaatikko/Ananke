import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import DiaryScreen from './components/screens/DiaryScreen';
import MainMenuScreen from './components/screens/MainMenuScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import SkillTreeScreen from './components/screens/SkillTreeScreen';
import { dateKey } from './components/utils/dateUtils';
import {
  createTask,
  initializeLocalDatabase,
  saveDiaryEntry,
  updateTaskCompletion,
} from './components/storage/localDatabase';
import { localSkillRepository } from './components/storage/localSkillRepository';
import type { DiaryEntry, Task } from './components/storage/localDatabase';
import type { NewSkill, Skill } from './components/storage/skillRepository';
import { COLORS } from './components/theme/theme';

type Page = 'home' | 'diary' | 'profile' | 'skills';

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function App() {
  const today = new Date();
  const todayKey = dateKey(today);
  const [page, setPage] = useState<Page>('home');
  const [tasksByDate, setTasksByDate] = useState<Record<string, Task[]>>({});
  const [taskInput, setTaskInput] = useState('');
  const [entries, setEntries] = useState<Record<string, DiaryEntry>>({});
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [databaseReady, setDatabaseReady] = useState(false);
  const [databaseRetry, setDatabaseRetry] = useState(0);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadLocalData() {
      try {
        const data = await initializeLocalDatabase(todayKey);
        if (!active) return;
        setTasksByDate(data.tasksByDate);
        setEntries(data.entries);
        setSkills(data.skills);
        setDatabaseReady(true);
        setStorageError(null);
      } catch (error) {
        if (active) {
          setStorageError(
            getErrorMessage(error, 'Paikallisen tietokannan avaaminen epäonnistui.'),
          );
        }
      }
    }

    void loadLocalData();
    return () => {
      active = false;
    };
  }, [databaseRetry, todayKey]);

  const dailyTasks = tasksByDate[todayKey] ?? [];

  async function addTask() {
    const title = taskInput.trim();
    if (!title || !databaseReady) return;

    try {
      const task = await createTask(todayKey, title);
      setTasksByDate((current) => ({
        ...current,
        [todayKey]: [...(current[todayKey] ?? []), task],
      }));
      setTaskInput('');
      setStorageError(null);
    } catch (error) {
      setStorageError(getErrorMessage(error, 'Tehtävän tallennus epäonnistui.'));
    }
  }

  async function addSkill(skill: NewSkill): Promise<boolean> {
    if (!databaseReady) return false;

    try {
      const createdSkill = await localSkillRepository.create(skill);
      setSkills((current) => [...current, createdSkill]);
      setStorageError(null);
      return true;
    } catch (error) {
      setStorageError(getErrorMessage(error, 'Taidon tallennus epäonnistui.'));
      return false;
    }
  }

  async function resetSkills(): Promise<boolean> {
    if (!databaseReady) return false;

    try {
      setSkills(await localSkillRepository.reset());
      setStorageError(null);
      return true;
    } catch (error) {
      setStorageError(getErrorMessage(error, 'Taitopuun palautus epäonnistui.'));
      return false;
    }
  }

  async function toggleTask(id: number) {
    const task = dailyTasks.find((item) => item.id === id);
    if (!task || !databaseReady) return;
    const done = !task.done;

    try {
      await updateTaskCompletion(id, done);
      setTasksByDate((current) => ({
        ...current,
        [todayKey]: (current[todayKey] ?? []).map((item) =>
          item.id === id ? { ...item, done } : item,
        ),
      }));
      setStorageError(null);
    } catch (error) {
      setStorageError(getErrorMessage(error, 'Tehtävän tilan tallennus epäonnistui.'));
    }
  }

  function updateEntry(key: string, entry: DiaryEntry) {
    setEntries((current) => ({ ...current, [key]: entry }));
    if (!databaseReady) return;

    void saveDiaryEntry(key, entry)
      .then(() => setStorageError(null))
      .catch((error: unknown) => {
        setStorageError(
          getErrorMessage(error, 'Päiväkirjamerkinnän tallennus epäonnistui.'),
        );
      });
  }

  function changeMonth(amount: number) {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
  }

  if (!databaseReady) {
    return (
      <View style={[styles.app, styles.databaseScreen]}>
        <StatusBar style="light" />
        <View style={styles.brandMark}>
          <Text style={styles.brandMarkText}>A</Text>
        </View>
        <Text style={styles.databaseTitle}>
          {storageError ? 'Tallennustilaa ei voitu avata' : 'Ladataan paikallisia tietoja...'}
        </Text>
        {storageError && (
          <>
            <Text style={styles.databaseError}>{storageError}</Text>
            <Pressable
              style={styles.retryButton}
              onPress={() => {
                setStorageError(null);
                setDatabaseRetry((value) => value + 1);
              }}
            >
              <Text style={styles.retryButtonText}>Yritä uudelleen</Text>
            </Pressable>
          </>
        )}
      </View>
    );
  }

  return (
    <View style={styles.app}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View style={styles.brandMark}>
          <Text style={styles.brandMarkText}>A</Text>
        </View>
        <View>
          <Text style={styles.brand}>ANANKE</Text>
          <Text style={styles.brandCaption}>YOUR DAILY QUEST</Text>
        </View>
        <View style={styles.headerDay}>
          <Text style={styles.headerDayText}>
            {today.toLocaleDateString('fi-FI', { day: '2-digit', month: '2-digit' })}
          </Text>
        </View>
      </View>

      {storageError && (
        <View style={styles.storageErrorBanner}>
          <Text style={styles.storageErrorText}>Tallennusvirhe: {storageError}</Text>
        </View>
      )}

      {page === 'home' && (
        <MainMenuScreen
          today={today}
          tasks={dailyTasks}
          taskInput={taskInput}
          onTaskInputChange={setTaskInput}
          onAddTask={addTask}
          onToggleTask={toggleTask}
          onOpenDiary={() => setPage('diary')}
        />
      )}
      {page === 'diary' && (
        <DiaryScreen
          entries={entries}
          selectedDate={selectedDate}
          visibleMonth={visibleMonth}
          onChangeMonth={changeMonth}
          onSelectDate={setSelectedDate}
          onUpdateEntry={updateEntry}
        />
      )}
      {page === 'profile' && <ProfileScreen />}
      {page === 'skills' && (
        <SkillTreeScreen
          skills={skills}
          onCreateSkill={addSkill}
          onResetSkills={resetSkills}
        />
      )}

      <View style={styles.bottomNav}>
        <NavButton
          label="KOTI"
          icon="⌂"
          selected={page === 'home'}
          onPress={() => setPage('home')}
        />
        <NavButton
          label="PÄIVÄKIRJA"
          icon="▦"
          selected={page === 'diary'}
          onPress={() => setPage('diary')}
        />
        <NavButton
          label="PROFIILI"
          icon="◇"
          selected={page === 'profile'}
          onPress={() => setPage('profile')}
        />
        <NavButton
          label="TAITOPUU"
          icon="⌘"
          selected={page === 'skills'}
          onPress={() => setPage('skills')}
        />
      </View>
    </View>
  );
}

function NavButton({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.navButton}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.navIcon, selected && styles.navSelected]}>{icon}</Text>
      <Text style={[styles.navLabel, selected && styles.navSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  databaseScreen: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  databaseTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
  databaseError: {
    color: '#F08C82',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: COLORS.accent,
  },
  retryButtonText: {
    color: COLORS.background,
    fontSize: 13,
    fontWeight: '700',
  },
  storageErrorBanner: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    backgroundColor: '#3A211F',
  },
  storageErrorText: {
    color: '#FFC2BA',
    fontSize: 12,
    lineHeight: 17,
  },
  header: {
    height: 74,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 12,
    marginRight: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
  },
  brandMarkText: {
    color: COLORS.background,
    fontSize: 21,
    fontWeight: '900',
  },
  brand: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
  brandCaption: {
    color: COLORS.muted,
    fontSize: 8,
    letterSpacing: 1.5,
    marginTop: 3,
  },
  headerDay: {
    marginLeft: 'auto',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
  },
  headerDayText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  bottomNav: {
    minHeight: 72,
    paddingHorizontal: 15,
    paddingTop: 8,
    paddingBottom: 9,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  navIcon: {
    color: COLORS.muted,
    fontSize: 20,
    lineHeight: 23,
  },
  navLabel: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
  },
  navSelected: {
    color: COLORS.accent,
  },
});
