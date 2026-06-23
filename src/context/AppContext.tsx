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
  addDrink: (date: string, drinkId: string, label?: string) => void;
  removeDrink: (date: string, entryId: string) => void;
  goNext: () => void;
  goPrev: () => void;
  setViewMode: (mode: 'month' | 'week') => void;
  getStats: () => { brewCount: number; shopCount: number; drinkList: Drink[] };
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

  const addDrink = useCallback((date: string, drinkId: string, label?: string) => {
    setCheckIns((prev) => {
      const existing = prev[date] ?? [];
      const entry: DrinkEntry = {
        id: genId(),
        drinkId,
        timestamp: Date.now(),
        label: label?.trim() || undefined,
      };
      const next = { ...prev, [date]: [...existing, entry] };

      return next;
    });
  }, []);

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
    brewCount: number;
    shopCount: number;
    drinkList: Drink[];
  } => {
    if (viewMode === 'month') {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      let brewCount = 0;
      const brandSet = new Set<string>();
      const drinkIds: string[] = [];

      Object.entries(checkIns).forEach(([date, entries]) => {
        const [y, m] = date.split('-').map(Number);
        if (y === year && m === month + 1) {
          brewCount += entries.length;
          entries.forEach((e) => {
            const drink = getDrinkById(e.drinkId);
            if (drink) {
              brandSet.add(drink.brand);
              drinkIds.push(drink.id);
            }
          });
        }
      });

      const drinkList = drinkIds
        .map((id) => getDrinkById(id))
        .filter(Boolean) as Drink[];

      return { brewCount, shopCount: brandSet.size, drinkList };
    }

    const days = getWeekDays(currentDate);
    let brewCount = 0;
    const brandSet = new Set<string>();
    const drinkIds: string[] = [];

    days.forEach((d) => {
      const key = formatDateKey(d);
      const entries = checkIns[key];
      if (entries) {
        brewCount += entries.length;
        entries.forEach((e) => {
          const drink = getDrinkById(e.drinkId);
          if (drink) {
            brandSet.add(drink.brand);
            drinkIds.push(drink.id);
          }
        });
      }
    });

    const drinkList = drinkIds
      .map((id) => getDrinkById(id))
      .filter(Boolean) as Drink[];

    return { brewCount, shopCount: brandSet.size, drinkList };
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
