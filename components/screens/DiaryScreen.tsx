import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { DiaryEntry } from '../storage/localDatabase';
import { dateKey, formatDate } from '../utils/dateUtils';
import { COLORS } from '../theme/theme';

type Props = {
  entries: Record<string, DiaryEntry>;
  selectedDate: Date;
  visibleMonth: Date;
  onChangeMonth: (amount: number) => void;
  onSelectDate: (date: Date) => void;
  onUpdateEntry: (key: string, entry: DiaryEntry) => void;
};

const WEEKDAYS = ['MA', 'TI', 'KE', 'TO', 'PE', 'LA', 'SU'];
const MONTHS = [
  'tammikuu',
  'helmikuu',
  'maaliskuu',
  'huhtikuu',
  'toukokuu',
  'kesäkuu',
  'heinäkuu',
  'elokuu',
  'syyskuu',
  'lokakuu',
  'marraskuu',
  'joulukuu',
];

export default function DiaryScreen({
  entries,
  selectedDate,
  visibleMonth,
  onChangeMonth,
  onSelectDate,
  onUpdateEntry,
}: Props) {
  const selectedKey = dateKey(selectedDate);
  const selectedEntry = entries[selectedKey] ?? { thoughts: '', rating: null };
  const daysInMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    0,
  ).getDate();
  const firstWeekday =
    (new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1).getDay() + 6) % 7;

  function updateEntry(update: Partial<DiaryEntry>) {
    onUpdateEntry(selectedKey, { ...selectedEntry, ...update });
  }

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentInner}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.eyebrow}>PYSÄHDY HETKEKSI</Text>
      <Text style={styles.title}>Päiväkirja</Text>
      <Text style={styles.subtitle}>Päivä kerrallaan, omalla tavallasi.</Text>

      <View style={styles.calendarCard}>
        <View style={styles.monthHeader}>
          <Pressable
            style={styles.monthButton}
            onPress={() => onChangeMonth(-1)}
            accessibilityLabel="Edellinen kuukausi"
          >
            <Text style={styles.monthArrow}>‹</Text>
          </Pressable>
          <Text style={styles.monthTitle}>
            {MONTHS[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
          </Text>
          <Pressable
            style={styles.monthButton}
            onPress={() => onChangeMonth(1)}
            accessibilityLabel="Seuraava kuukausi"
          >
            <Text style={styles.monthArrow}>›</Text>
          </Pressable>
        </View>
        <View style={styles.calendarGrid}>
          {WEEKDAYS.map((day) => (
            <View key={day} style={styles.calendarCell}>
              <Text style={styles.weekdayText}>{day}</Text>
            </View>
          ))}
          {Array.from({ length: firstWeekday }, (_, index) => (
            <View key={`empty-${index}`} style={styles.calendarCell} />
          ))}
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;
            const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
            const key = dateKey(date);
            const isSelected = selectedKey === key;
            const entry = entries[key];
            const hasEntry = Boolean(
              entry && (entry.thoughts.trim() || entry.rating !== null),
            );

            return (
              <Pressable
                key={day}
                style={styles.calendarCell}
                onPress={() => onSelectDate(date)}
                accessibilityRole="button"
                accessibilityLabel={`${day}. ${MONTHS[visibleMonth.getMonth()]}`}
                accessibilityState={{ selected: isSelected }}
              >
                <View style={[styles.dayNumber, isSelected && styles.selectedDay]}>
                  <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
                    {day}
                  </Text>
                  {hasEntry && <View style={styles.entryDot} />}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.entryHeading}>
        <Text style={styles.sectionTitle}>{formatDate(selectedDate)}</Text>
        <Text style={styles.sectionMeta}>PÄIVÄN MERKINTÄ</Text>
      </View>

      <Text style={styles.inputLabel}>MITÄ MIELESSÄSI?</Text>
      <TextInput
        style={styles.thoughtsInput}
        value={selectedEntry.thoughts}
        onChangeText={(thoughts) => updateEntry({ thoughts })}
        placeholder="Kirjoita ajatuksesi tähän..."
        placeholderTextColor={COLORS.muted}
        multiline
        textAlignVertical="top"
        maxLength={2000}
      />

      <Text style={styles.inputLabel}>ARVOSANA PÄIVÄLLE</Text>
      <View style={styles.ratingRow}>
        {Array.from({ length: 11 }, (_, rating) => (
          <Pressable
            key={rating}
            style={[
              styles.ratingButton,
              selectedEntry.rating === rating && styles.ratingButtonSelected,
            ]}
            onPress={() => updateEntry({ rating })}
            accessibilityRole="button"
            accessibilityLabel={`Arvosana ${rating}`}
            accessibilityState={{ selected: selectedEntry.rating === rating }}
          >
            <Text
              style={[
                styles.ratingText,
                selectedEntry.rating === rating && styles.ratingTextSelected,
              ]}
            >
              {rating}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.ratingHint}>0 = raskas päivä     10 = erinomainen päivä</Text>
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
  },
  calendarCard: {
    marginTop: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  monthButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.raised,
  },
  monthArrow: {
    color: COLORS.accent,
    fontSize: 24,
    lineHeight: 27,
  },
  monthTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: '14.2857%',
    height: 41,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayText: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '700',
  },
  dayNumber: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDay: {
    backgroundColor: COLORS.accent,
  },
  dayText: {
    color: COLORS.text,
    fontSize: 12,
  },
  selectedDayText: {
    color: COLORS.background,
    fontWeight: '800',
  },
  entryDot: {
    position: 'absolute',
    bottom: 3,
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
  },
  entryHeading: {
    marginTop: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  sectionMeta: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  inputLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.3,
    marginTop: 21,
    marginBottom: 9,
  },
  thoughtsInput: {
    minHeight: 132,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 21,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 3,
  },
  ratingButton: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  ratingButtonSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent,
  },
  ratingText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  ratingTextSelected: {
    color: COLORS.background,
    fontWeight: '800',
  },
  ratingHint: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 9,
  },
});
