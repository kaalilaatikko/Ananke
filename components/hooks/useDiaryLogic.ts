import { useEffect, useRef, useState } from 'react';
import { supabaseDiaryRepository } from '../storage/supabaseDiaryRepository';
import type { DiaryEntry } from '../storage/supabaseDiaryRepository';

type Props = {
  today: Date;
  databaseReady: boolean;
  onStorageError: (message: string | null) => void;
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useDiaryLogic({
  today,
  databaseReady,
  onStorageError,
}: Props) {
  const [entries, setEntries] = useState<Record<string, DiaryEntry>>({});
  const [selectedDate, setSelectedDate] = useState(today);
  const pendingEntries = useRef(new Map<string, DiaryEntry>());
  const saveTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  useEffect(() => {
    if (!databaseReady) return;
    let active = true;

    supabaseDiaryRepository
      .list()
      .then((loadedEntries) => {
        if (active) setEntries(loadedEntries);
      })
      .catch((error: unknown) => {
        if (active) {
          onStorageError(
            getErrorMessage(error, 'Päiväkirjamerkintöjen lataaminen epäonnistui.'),
          );
        }
      });

    return () => {
      active = false;
    };
  }, [databaseReady, onStorageError]);

  useEffect(
    () => () => {
      for (const timer of saveTimers.current.values()) clearTimeout(timer);
      saveTimers.current.clear();

      for (const [date, entry] of pendingEntries.current) {
        void supabaseDiaryRepository.save(date, entry).catch((error: unknown) => {
          onStorageError(
            getErrorMessage(error, 'Päiväkirjamerkinnän tallennus epäonnistui.'),
          );
        });
      }
      pendingEntries.current.clear();
    },
    [onStorageError],
  );

  function updateEntry(key: string, entry: DiaryEntry) {
    setEntries((current) => ({ ...current, [key]: entry }));
    if (!databaseReady) return;

    const previousTimer = saveTimers.current.get(key);
    if (previousTimer) clearTimeout(previousTimer);
    pendingEntries.current.set(key, entry);

    saveTimers.current.set(
      key,
      setTimeout(() => {
        saveTimers.current.delete(key);
        const pendingEntry = pendingEntries.current.get(key);
        pendingEntries.current.delete(key);
        if (!pendingEntry) return;

        void supabaseDiaryRepository
          .save(key, pendingEntry)
          .then(() => onStorageError(null))
          .catch((error: unknown) => {
            onStorageError(
              getErrorMessage(error, 'Päiväkirjamerkinnän tallennus epäonnistui.'),
            );
          });
      }, 500),
    );
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
