import { useEffect, useState } from 'react';
import { saveDiaryEntry } from '../storage/localDatabase';
import type { DiaryEntry } from '../storage/localDatabase';

type Props = {
  today: Date;
  initialEntries: Record<string, DiaryEntry> | null;
  databaseReady: boolean;
  onStorageError: (message: string | null) => void;
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useDiaryLogic({
  today,
  initialEntries,
  databaseReady,
  onStorageError,
}: Props) {
  const [entries, setEntries] = useState<Record<string, DiaryEntry>>({});
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  useEffect(() => {
    if (initialEntries) {
      setEntries(initialEntries);
    }
  }, [initialEntries]);

  function updateEntry(key: string, entry: DiaryEntry) {
    setEntries((current) => ({ ...current, [key]: entry }));
    if (!databaseReady) return;

    void saveDiaryEntry(key, entry)
      .then(() => onStorageError(null))
      .catch((error: unknown) => {
        onStorageError(
          getErrorMessage(error, 'Päiväkirjamerkinnän tallennus epäonnistui.'),
        );
      });
  }

  function changeMonth(amount: number) {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
  }

  return {
    entries,
    selectedDate,
    setSelectedDate,
    visibleMonth,
    changeMonth,
    updateEntry,
  };
}
