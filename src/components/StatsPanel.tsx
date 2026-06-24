import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useDerivedValue,
  Easing,
} from 'react-native-reanimated';
import { type Drink } from '../data/drinkLibrary';
import { Colors, Shadows } from '../styles/colors';
import { FontSize, FontWeight, Motion, Radius, Spacing } from '../styles/tokens';
import DrinkSticker from './DrinkSticker';

interface Props {
  brewCount: number;
  shopCount: number;
  drinkList: Drink[];
  viewMode: 'month' | 'week';
}

export default function StatsPanel({
  brewCount,
  shopCount,
  drinkList,
  viewMode,
}: Props) {
  const scope = viewMode === 'month' ? '本月' : '本周';

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['rgba(245, 230, 200, 0.04)', 'rgba(245, 230, 200, 0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{scope}饮品</Text>
          <AnimatedNumber value={brewCount} style={styles.statNumber} />
          <Text style={styles.statUnit}> 杯</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{scope}探店</Text>
          <AnimatedNumber value={shopCount} style={styles.statNumber} />
          <Text style={styles.statUnit}> 家</Text>
        </View>
      </View>

      {drinkList.length > 0 && (
        <View style={styles.drinkSummary}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryLabel}>饮品清单</Text>
            <View style={styles.dotline} />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.drinkScroll}
          >
            {drinkList.map((drink, i) => (
              <View key={`${drink.id}-${i}`} style={styles.stickerWrap}>
                <DrinkSticker drink={drink} size={28} />
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

type AnimatedNumberProps = {
  value: number;
  style?: any;
};

function AnimatedNumber({ value, style }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: Motion.timingSlow * 2.5,
      easing: Easing.out(Easing.cubic),
    });
    const start = display;
    const diff = value - start;
    const id = setTimeout(() => {
      setDisplay(value);
    }, Motion.timingSlow * 2.5);
    return () => clearTimeout(id);
  }, [value]);

  useEffect(() => {
    const id = setInterval(() => {
      const current = Math.round(progress.value * value);
      setDisplay(current);
    }, 32);
    return () => clearInterval(id);
  }, [value]);

  return <Text style={style}>{display}</Text>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    ...Shadows.card,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    marginBottom: Spacing.xs,
    letterSpacing: 0.4,
  },
  statNumber: {
    color: Colors.textPrimary,
    fontSize: 40,
    fontWeight: FontWeight.bold,
    lineHeight: 44,
    fontVariant: ['tabular-nums'],
  },
  statUnit: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border,
    marginBottom: Spacing.xs,
  },
  drinkSummary: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.borderSoft,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    letterSpacing: 0.4,
  },
  dotline: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.borderSoft,
  },
  drinkScroll: {
    gap: Spacing.sm,
    paddingRight: Spacing.xs,
  },
  stickerWrap: {
    marginRight: 2,
  },
});
