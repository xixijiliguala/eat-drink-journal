import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  Caveat_400Regular,
  Caveat_600SemiBold,
} from '@expo-google-fonts/caveat';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { AppProvider, useApp } from './src/context/AppContext';
import { getMonthGrid, getWeekDays, getMonthName, getWeekRangeName, formatDateKey } from './src/utils/calendar';
import { Colors } from './src/styles/colors';
import { PaperBackground } from './src/components/backgrounds/PaperBackground';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import Header from './src/components/Header';
import MonthCalendar from './src/components/MonthCalendar';
import WeekCalendar from './src/components/WeekCalendar';
import StatsPanel from './src/components/StatsPanel';
import DrinkPicker from './src/components/DrinkPicker';
import StickyNote from './src/components/StickyNote';
import TarotModal from './src/components/TarotModal';
import FriendsModal from './src/components/FriendsModal';
import AccountModal from './src/components/AccountModal';
import NicknamePrompt from './src/components/NicknamePrompt';
import { getDeviceId } from './src/utils/deviceId';
import { initLC, getMyNickname, setMyNickname, getOrCreateShareCode, syncTodayDrinks } from './src/utils/serverApi';
import { getStickerCache } from './src/utils/stickerCache';

const NICKNAME_KEY = '@drink_journal_nickname';

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
  const [friendsVisible, setFriendsVisible] = useState(false);
  const [accountVisible, setAccountVisible] = useState(false);
  const [nickVisible, setNickVisible] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('');

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
    (
      dateStr: string,
      drinkId: string,
      label?: string,
      scale?: number,
      offsetX?: number,
      offsetY?: number
    ) => {
      addDrink(dateStr, drinkId, label, scale, offsetX, offsetY);
    },
    [addDrink]
  );

  const handleTarotOpen = useCallback(() => {
    setTarotVisible(true);
  }, []);

  const handleFriendsOpen = useCallback(() => {
    setFriendsVisible(true);
  }, []);

  const handleSettingsOpen = useCallback(() => {
    setAccountVisible(true);
  }, []);

  const handleNickDone = useCallback(async (name: string, av: string) => {
    setNickname(name);
    if (av) setAvatar(av);
    setNickVisible(false);
    await AsyncStorage.setItem(NICKNAME_KEY, name);
    const id = await getDeviceId();
    await setMyNickname(id, name);
  }, []);

  useEffect(() => {
    initLC();
    (async () => {
      const id = await getDeviceId();
      setDeviceId(id);
      await getOrCreateShareCode(id).catch(() => {});
      const saved = await AsyncStorage.getItem(NICKNAME_KEY);
      const savedAv = await AsyncStorage.getItem('@drink_journal_avatar');
      if (savedAv) setAvatar(savedAv);
      if (saved) {
        setNickname(saved);
        setMyNickname(id, saved).catch(() => {});
      } else {
        const remote = await getMyNickname(id).catch(() => null);
        if (remote) {
          setNickname(remote);
          await AsyncStorage.setItem(NICKNAME_KEY, remote);
        } else {
          setNickVisible(true);
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (!deviceId || isLoading) return;
    const date = formatDateKey(new Date());
    const entries = (checkIns[date] || []).map((e) => ({
      drinkId: e.drinkId,
      label: e.label || '',
    }));
    syncTodayDrinks(deviceId, nickname || '', date, entries, (drinkId) => getStickerCache(drinkId)).catch(() => {});
  }, [checkIns, deviceId, nickname, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.tabActive} />
      </View>
    );
  }

  const showStickyNote = stats.primary.count === 0;
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
          onFriendsPress={handleFriendsOpen}
          onSettingsPress={handleSettingsOpen}
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
          primary={stats.primary}
          secondary={stats.secondary}
          drinkList={stats.drinkList}
        />

        {showStickyNote && <StickyNote message={stickyMsg} onSecretTap={handleSettingsOpen} />}
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

      <FriendsModal
        visible={friendsVisible}
        myDeviceId={deviceId}
        myNickname={nickname}
        onClose={() => setFriendsVisible(false)}
      />

      <AccountModal
        visible={accountVisible}
        myDeviceId={deviceId}
        myNickname={nickname}
        myAvatar={avatar}
        onClose={() => setAccountVisible(false)}
        onNicknameChange={setNickname}
        onAvatarChange={setAvatar}
      />

      <NicknamePrompt
        visible={nickVisible}
        onDone={handleNickDone}
      />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Caveat: Caveat_400Regular,
    CaveatSemiBold: Caveat_600SemiBold,
    Inter: Inter_400Regular,
    InterMedium: Inter_500Medium,
    InterSemiBold: Inter_600SemiBold,
    InterBold: Inter_700Bold,
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
      <ErrorBoundary>
        <AppProvider>
          <MainScreen />
        </AppProvider>
      </ErrorBoundary>
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