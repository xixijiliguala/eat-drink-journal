import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initCacheFromStorage } from '../utils/stickerStorage';

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 12);
}

import { getDrinkById, type Drink } from '../data/drinkLibrary';
import {
  getWeekDays,
  addMonths,
  addWeeks,
  formatDateKey,
} from '../utils/calendar';

const STORAGE_KEY = '@drink_journal_checkins';

export interface DrinkEntry {
  id: string;
  drinkId: string;
  timestamp: number;
  label?: string;
  scale?: number;
  offsetX?: number;
  offsetY?: number;
}

interface CheckInData {
  [date: string]: DrinkEntry[];
}

interface AppState {
  checkIns: CheckInData;
  currentDate: Date;
  viewMode: 'month' | 'week';
  isLoading: boolean;
}

interface AppContextValue extends AppState {
  addDrink: (
    date: string,
    drinkId: string,
    label?: string,
    scale?: number,
    offsetX?: number,
    offsetY?: number
  ) => void;
  removeDrink: (date: string, entryId: string) => void;
  goNext: () => void;
  goPrev: () => void;
  setViewMode: (mode: 'month' | 'week') => void;
  getStats: () => {
    primary: { count: number; label: string };
    secondary: { count: number; label: string };
    drinkList: Drink[];
  };
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [checkIns, setCheckIns] = useState<CheckInData>({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [isLoading, setIsLoading] = useState(true);
  const isLoaded = useRef(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      initCacheFromStorage(),
    ])
      .then(([checkInRaw]) => {
        if (checkInRaw) {
          try { setCheckIns(JSON.parse(checkInRaw)); } catch { setCheckIns({}); }
        }
      })
      .finally(() => {
        setIsLoading(false);
        isLoaded.current = true;
      });
  }, []);

  useEffect(() => {
    if (!isLoaded.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(checkIns)).catch(() => {});
  }, [checkIns]);

  const addDrink = useCallback(
    (
      date: string,
      drinkId: string,
      label?: string,
      scale?: number,
      offsetX?: number,
      offsetY?: number
    ) => {
      setCheckIns((prev) => {
        const existing = prev[date] ?? [];
        const entry: DrinkEntry = {
          id: genId(),
          drinkId,
          timestamp: Date.now(),
          label: label?.trim() || undefined,
          scale: scale && scale > 0 ? scale : undefined,
          offsetX: offsetX ? Math.round(offsetX) : undefined,
          offsetY: offsetY ? Math.round(offsetY) : undefined,
        };
        const next = { ...prev, [date]: [...existing, entry] };

        return next;
      });
    },
    []
  );

  const removeDrink = useCallback((date: string, entryId: string) => {
    setCheckIns((prev) => {
      const existing = prev[date];
      if (!existing) return prev;
      const filtered = existing.filter((e) => e.id !== entryId);
      if (filtered.length === 0) {
        const next = { ...prev };
        delete next[date];
        return next;
      }
      return { ...prev, [date]: filtered };
    });
  }, []);

  const goNext = useCallback(() => {
    setCurrentDate((d) =>
      viewMode === 'month' ? addMonths(d, 1) : addWeeks(d, 1)
    );
  }, [viewMode]);

  const goPrev = useCallback(() => {
    setCurrentDate((d) =>
      viewMode === 'month' ? addMonths(d, -1) : addWeeks(d, -1)
    );
  }, [viewMode]);

  const getStats = useCallback((): {
    primary: { count: number; label: string };
    secondary: { count: number; label: string };
    drinkList: Drink[];
  } => {
    const todayKey = formatDateKey(new Date());
    const todayEntries = checkIns[todayKey] ?? [];
    const todayCount = todayEntries.length;

    const collectDrinksInRange = (predicate: (y: number, m: number, d: number) => boolean) => {
      let count = 0;
      const drinkIds: string[] = [];
      Object.entries(checkIns).forEach(([date, entries]) => {
        const [y, m, d] = date.split('-').map(Number);
        if (predicate(y, m, d)) {
          count += entries.length;
          entries.forEach((e) => {
            const drink = getDrinkById(e.drinkId);
            if (drink) drinkIds.push(drink.id);
          });
        }
      });
      const drinkList = drinkIds
        .map((id) => getDrinkById(id))
        .filter(Boolean) as Drink[];
      return { count, drinkList };
    };

    const weekDays = getWeekDays(currentDate);
    const weekKeys = new Set(weekDays.map((d) => formatDateKey(d)));
    const weekCollect = collectDrinksInRange((_y, _m, d) => {
      const k = `${_y}-${String(_m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      return weekKeys.has(k);
    });

    if (viewMode === 'month') {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const monthCollect = collectDrinksInRange((y, m) => y === year && m === month + 1);

      return {
        primary: { count: monthCollect.count, label: '本月进食' },
        secondary: { count: weekCollect.count, label: '本周进食' },
        drinkList: monthCollect.drinkList,
      };
    }

    return {
      primary: { count: weekCollect.count, label: '本周进食' },
      secondary: { count: todayCount, label: '当天进食' },
      drinkList: weekCollect.drinkList,
    };
  }, [checkIns, currentDate, viewMode]);

  return (
    <AppContext.Provider
      value={{
        checkIns,
        currentDate,
        viewMode,
        isLoading,
        addDrink,
        removeDrink,
        goNext,
        goPrev,
        setViewMode,
        getStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
}