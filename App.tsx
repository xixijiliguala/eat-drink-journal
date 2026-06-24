import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  Caveat_400Regular,
} from '@expo-google-fonts/caveat';
import { AppProvider, useApp } from './src/context/AppContext';
import { getMonthGrid, getWeekDays, getMonthName, getWeekRangeName } from './src/utils/calendar';
import { Colors } from './src/styles/colors';
import Header from './src/components/Header';
import MonthCalendar from './src/components/MonthCalendar';
import WeekCalendar from './src/components/WeekCalendar';
import StatsPanel from './src/components/StatsPanel';
import DrinkPicker from './src/components/DrinkPicker';
import StickyNote from './src/components/StickyNote';
import TarotModal from './src/components/TarotModal';
import { PaperBackground } from './src/components/backgrounds/PaperBackground';

function MainScreen() {
  const {
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
  } = useApp();

  const [pickerDate, setPickerDate] = useState<string | null>(null);
  const [tarotVisible, setTarotVisible] = useState(false);

  const title = useMemo(() => {
    if (viewMode === 'month') {
      return getMonthName(currentDate.getFullYear(), currentDate.getMonth());
    }
    const days = getWeekDays(currentDate);
    return getWeekRangeName(days);
  }, [currentDate, viewMode]);

  const monthData = useMemo(() => {
    if (viewMode !== 'month') return null;
    return getMonthGrid(currentDate.getFullYear(), currentDate.getMonth());
  }, [currentDate, viewMode]);

  const weekData = useMemo(() => {
    if (viewMode !== 'week') return null;
    return getWeekDays(currentDate);
  }, [currentDate, viewMode]);

  const stats = useMemo(() => getStats(), [getStats]);

  const handleToggleMode = useCallback(() => {
    setViewMode(viewMode === 'month' ? 'week' : 'month');
  }, [viewMode, setViewMode]);

  const handlePressDate = useCallback((dateStr: string) => {
    setPickerDate(dateStr);
  }, []);

  const handleSelectDrink = useCallback(
    (dateStr: string, drinkId: string, label?: string) => {
      addDrink(dateStr, drinkId, label);
    },
    [addDrink]
  );

  const handleTarotOpen = useCallback(() => {
    setTarotVisible(true);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.tabActive} />
      </View>
    );
  }

  const showStickyNote = stats.brewCount === 0;
  const stickyMessages = [
    'Tap a date to start journaling!',
    'What did you drink today?',
    'Your drink diary awaits...',
  ];
  const stickyMsg = stickyMessages[Math.floor(Math.random() * stickyMessages.length)];

  return (
    <View style={styles.safe}>
      <PaperBackground />
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header
          title={title}
          viewMode={viewMode}
          onToggleMode={handleToggleMode}
          onPrev={goPrev}
          onNext={goNext}
          onTarotPress={handleTarotOpen}
        />

        {viewMode === 'month' && monthData && (
          <MonthCalendar
            weeks={monthData}
            currentYear={currentDate.getFullYear()}
            currentMonth={currentDate.getMonth()}
            checkIns={checkIns}
            onPressDate={handlePressDate}
            onRemoveDrink={removeDrink}
            onSwipeLeft={goNext}
            onSwipeRight={goPrev}
          />
        )}

        {viewMode === 'week' && weekData && (
          <WeekCalendar
            days={weekData}
            checkIns={checkIns}
            onPressDate={handlePressDate}
            onRemoveDrink={removeDrink}
            onSwipeLeft={goNext}
            onSwipeRight={goPrev}
          />
        )}

        <StatsPanel
          brewCount={stats.brewCount}
          shopCount={stats.shopCount}
          drinkList={stats.drinkList}
          viewMode={viewMode}
        />

        {showStickyNote && <StickyNote message={stickyMsg} />}
      </ScrollView>

      <DrinkPicker
        visible={pickerDate !== null}
        dateStr={pickerDate}
        onClose={() => setPickerDate(null)}
        onSelect={handleSelectDrink}
        onRemoveDrink={removeDrink}
        existingEntryIds={
          pickerDate && checkIns[pickerDate]
            ? checkIns[pickerDate].map((e) => ({
                entryId: e.id,
                drinkId: e.drinkId,
              }))
            : []
        }
      />

      <TarotModal
        visible={tarotVisible}
        onClose={() => setTarotVisible(false)}
      />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Caveat: Caveat_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.tabActive} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <MainScreen />
      </AppProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 44) : 44,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center' as const,
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  loading: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
});
