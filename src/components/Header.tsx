import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../styles/colors';
import PressableBounce from './PressableBounce';

interface Props {
  title: string;
  viewMode: 'month' | 'week';
  onToggleMode: () => void;
  onPrev: () => void;
  onNext: () => void;
  onTarotPress: () => void;
}

export default function Header({
  title,
  viewMode,
  onToggleMode,
  onPrev,
  onNext,
  onTarotPress,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.navRow}>
        <PressableBounce onPress={onPrev} scaleTo={0.85} style={styles.arrowBtn}>
          <Text style={styles.arrow}>{'<'}</Text>
        </PressableBounce>

        <Text style={styles.title}>{title}</Text>

        <PressableBounce onPress={onNext} scaleTo={0.85} style={styles.arrowBtn}>
          <Text style={styles.arrow}>{'>'}</Text>
        </PressableBounce>
      </View>

      <View style={styles.toggleRow}>
        <PressableBounce onPress={onTarotPress} scaleTo={0.85} style={styles.tarotBtn}>
          <Text style={styles.tarotIcon}>{'\u2726'}</Text>
        </PressableBounce>

        <View style={styles.toggle}>
          <PressableBounce
            onPress={onToggleMode}
            scaleTo={0.95}
            style={[styles.toggleTab, viewMode === 'month' && styles.toggleActive]}
          >
            <Text style={[styles.toggleText, viewMode === 'month' && styles.toggleTextActive]}>Month</Text>
          </PressableBounce>
          <PressableBounce
            onPress={onToggleMode}
            scaleTo={0.95}
            style={[styles.toggleTab, viewMode === 'week' && styles.toggleActive]}
          >
            <Text style={[styles.toggleText, viewMode === 'week' && styles.toggleTextActive]}>Week</Text>
          </PressableBounce>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center' as const,
    paddingVertical: 16,
    paddingTop: 28,
  },
  navRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 16,
  },
  arrowBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  arrow: {
    color: Colors.textSecondary,
    fontSize: 20,
    fontWeight: '300' as const,
  },
  title: {
    color: Colors.white,
    fontSize: 26,
    fontFamily: 'Caveat',
  },
  toggleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginTop: 10,
    gap: 10,
  },
  toggle: {
    flexDirection: 'row' as const,
    backgroundColor: Colors.cellBg,
    borderRadius: 20,
    padding: 4,
    overflow: 'hidden' as const,
  },
  toggleTab: {
    paddingHorizontal: 22,
    paddingVertical: 7,
    borderRadius: 16,
  },
  toggleActive: {
    backgroundColor: Colors.textMuted,
  },
  toggleText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600' as const,
  },
  toggleTextActive: {
    color: Colors.white,
  },
  tarotBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.tarotCardBack,
    borderWidth: 1,
    borderColor: Colors.tarotGold,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  tarotIcon: {
    color: Colors.tarotGold,
    fontSize: 18,
  },
});
