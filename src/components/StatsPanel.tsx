import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Shadows } from '../styles/colors';
import { FontFamily, FontSize, FontWeight, Radius, Spacing } from '../styles/tokens';
import DrinkSticker from './DrinkSticker';
import { type Drink } from '../data/drinkLibrary';

interface Props {
  primary: { count: number; label: string };
  secondary: { count: number; label: string };
  drinkList: Drink[];
}

export default function StatsPanel({ primary, secondary, drinkList }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{primary.label}</Text>
          <AnimatedNumber value={primary.count} style={styles.statNumber} />
          <Text style={styles.statUnit}>杯</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{secondary.label}</Text>
          <AnimatedNumber value={secondary.count} style={styles.statNumber} />
          <Text style={styles.statUnit}>杯</Text>
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
  const startValRef = useRef(0);

  useEffect(() => {
    const start = startValRef.current;
    const end = value;
    const duration = 600;
    const startTime = Date.now();
    let raf: number;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else startValRef.current = end;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <Text style={[style, styles.numberGold]}>{display}</Text>;
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
    fontFamily: FontFamily.bodyMedium,
    fontWeight: FontWeight.medium,
  },
  statNumber: {
    fontSize: 40,
    lineHeight: 44,
    fontFamily: FontFamily.bodyBold,
    fontWeight: FontWeight.bold,
    fontVariant: ['tabular-nums'],
  },
  numberGold: {
    color: Colors.tarotGold,
  },
  statUnit: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.bodyMedium,
    fontWeight: FontWeight.medium,
    marginTop: 2,
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
    fontFamily: FontFamily.bodyMedium,
    fontWeight: FontWeight.medium,
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