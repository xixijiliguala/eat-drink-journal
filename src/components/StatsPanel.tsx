import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { type Drink } from '../data/drinkLibrary';
import { Colors, Shadows } from '../styles/colors';
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
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{scope}饮品</Text>
          <View style={styles.statValueRow}>
            <Text style={styles.statNumber}>{brewCount}</Text>
            <Text style={styles.statUnit}> 杯</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{scope}探店</Text>
          <View style={styles.statValueRow}>
            <Text style={styles.statNumber}>{shopCount}</Text>
            <Text style={styles.statUnit}> 家</Text>
          </View>
        </View>
      </View>

      {drinkList.length > 0 && (
        <View style={styles.drinkSummary}>
          <Text style={styles.summaryLabel}>饮品清单</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.drinkScroll}
          >
            {drinkList.map((drink, i) => (
              <View key={`${drink.id}-${i}`} style={styles.stickerWrap}>
                <DrinkSticker drink={drink} size={24} />
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 20,
    marginTop: 12,
    ...Shadows.card,
  },
  statsRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
  },
  statItem: {
    flex: 1,
    alignItems: 'center' as const,
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  statValueRow: {
    flexDirection: 'row' as const,
    alignItems: 'baseline' as const,
  },
  statNumber: {
    color: Colors.white,
    fontSize: 40,
    fontWeight: 'bold' as const,
    lineHeight: 44,
  },
  statUnit: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border,
    marginBottom: 4,
  },
  drinkSummary: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  summaryLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    marginBottom: 6,
  },
  drinkScroll: {
    gap: 6,
  },
  stickerWrap: {
    marginRight: 2,
  },
});
