import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Task } from '../storage/localDatabase';
import { formatDate } from '../utils/dateUtils';
import { COLORS } from '../theme/theme';

type Props = {
  today: Date;
  tasks: Task[];
  taskInput: string;
  onTaskInputChange: (value: string) => void;
  onAddTask: () => void;
  onToggleTask: (id: number) => void;
  onOpenDiary: () => void;
};

export default function MainMenuScreen({
  today,
  tasks,
  taskInput,
  onTaskInputChange,
  onAddTask,
  onToggleTask,
  onOpenDiary,
}: Props) {
  const completedTasks = tasks.filter((task) => task.done).length;
  const progress = tasks.length ? (completedTasks / tasks.length) * 100 : 0;

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentInner}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.eyebrow}>PÄIVÄN TEHTÄVÄT</Text>
      <Text style={styles.title}>Tänään</Text>
      <Text style={styles.subtitle}>{formatDate(today)}</Text>

      <View style={styles.progressCard}>
        <View style={styles.progressHeading}>
          <View>
            <Text style={styles.cardLabel}>PÄIVÄN ETENEMINEN</Text>
            <Text style={styles.progressCount}>
              {completedTasks} / {tasks.length} tehtävää
            </Text>
          </View>
          <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress}%` }]} />
        </View>
      </View>

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Tehtävälista</Text>
        <Text style={styles.sectionMeta}>{tasks.length} KPL</Text>
      </View>

      <View style={styles.taskList}>
        {tasks.length === 0 ? (
          <Text style={styles.emptyText}>Lisää ensimmäinen tehtäväsi tälle päivälle.</Text>
        ) : (
          tasks.map((task, index) => (
            <Pressable
              key={task.id}
              style={[styles.taskRow, index === tasks.length - 1 && styles.lastTaskRow]}
              onPress={() => onToggleTask(task.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: task.done }}
            >
              <View style={[styles.checkbox, task.done && styles.checkboxDone]}>
                {task.done && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.taskTitle, task.done && styles.taskDone]}>
                {task.title}
              </Text>
              <Text style={styles.taskArrow}>›</Text>
            </Pressable>
          ))
        )}
      </View>

      <Text style={styles.inputLabel}>LISÄÄ OMA TEHTÄVÄ</Text>
      <View style={styles.addTaskRow}>
        <TextInput
          style={styles.taskInput}
          value={taskInput}
          onChangeText={onTaskInputChange}
          onSubmitEditing={onAddTask}
          placeholder="Esim. salitreeni, lukeminen..."
          placeholderTextColor={COLORS.muted}
          returnKeyType="done"
          maxLength={70}
        />
        <Pressable
          style={styles.addButton}
          onPress={onAddTask}
          accessibilityLabel="Lisää tehtävä"
        >
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>

      <Pressable style={styles.diaryPrompt} onPress={onOpenDiary}>
        <View>
          <Text style={styles.cardLabel}>PÄIVÄN MUISTO</Text>
          <Text style={styles.diaryPromptTitle}>Miltä päivä tuntui?</Text>
        </View>
        <Text style={styles.promptArrow}>→</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: 22,
    paddingTop: 27,
    paddingBottom: 30,
  },
  eyebrow: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 9,
  },
  title: {
    color: COLORS.text,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 5,
    textTransform: 'capitalize',
  },
  progressCard: {
    marginTop: 25,
    padding: 17,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  progressHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },
  cardLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  progressCount: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 6,
  },
  progressPercent: {
    color: COLORS.accent,
    fontSize: 19,
    fontWeight: '700',
  },
  track: {
    height: 6,
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: COLORS.raised,
  },
  fill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
  },
  sectionMeta: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  taskList: {
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  taskRow: {
    minHeight: 57,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lastTaskRow: {
    borderBottomWidth: 0,
  },
  checkbox: {
    width: 21,
    height: 21,
    borderWidth: 1,
    borderColor: '#526568',
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxDone: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  checkmark: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: '900',
  },
  taskTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
  },
  taskDone: {
    color: COLORS.muted,
    textDecorationLine: 'line-through',
  },
  taskArrow: {
    color: COLORS.muted,
    fontSize: 22,
    marginLeft: 8,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 13,
    paddingVertical: 18,
  },
  inputLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.3,
    marginTop: 21,
    marginBottom: 9,
  },
  addTaskRow: {
    flexDirection: 'row',
    gap: 9,
  },
  taskInput: {
    minHeight: 49,
    flex: 1,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    fontSize: 13,
  },
  addButton: {
    width: 49,
    height: 49,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
  },
  addButtonText: {
    color: COLORS.background,
    fontSize: 27,
    fontWeight: '500',
    lineHeight: 30,
  },
  diaryPrompt: {
    minHeight: 79,
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  diaryPromptTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 6,
  },
  promptArrow: {
    color: COLORS.accent,
    fontSize: 23,
  },
});
