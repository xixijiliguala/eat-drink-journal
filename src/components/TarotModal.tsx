import React, { useState, useEffect } from 'react';
import { View, Text, Modal, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { drawCards, type TarotCard as TarotCardData } from '../data/tarotCards';
import { Colors } from '../styles/colors';
import { formatDateKey } from '../utils/calendar';
import PressableBounce from './PressableBounce';
import TarotCard from './TarotCard';

interface Props {
  visible: boolean;
  onClose: () => void;
}

type DrawResult = { card: TarotCardData; reversed: boolean; position: string };

const TAROT_DATE_KEY = '@drink_journal_tarot';
const TAROT_CARDS_KEY = '@drink_journal_tarot_cards';

export default function TarotModal({ visible, onClose }: Props) {
  const [drawn, setDrawn] = useState<DrawResult[] | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [allowFlip, setAllowFlip] = useState(false);
  const [loading, setLoading] = useState(true);

  const todayStr = formatDateKey(new Date());

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    (async () => {
      const savedDate = await AsyncStorage.getItem(TAROT_DATE_KEY);
      if (savedDate === todayStr) {
        const savedCards = await AsyncStorage.getItem(TAROT_CARDS_KEY);
        if (savedCards) {
          try {
            const cards = JSON.parse(savedCards);
            setDrawn(cards);
            setRevealed(true);
            setLoading(false);
            return;
          } catch {}
        }
      }
      const result = drawCards(3);
      setDrawn(result);
      setRevealed(false);
      setAllowFlip(true);
      setLoading(false);
    })();
  }, [visible, todayStr]);

  const handleDraw = () => {
    if (allowFlip) {
      setRevealed(true);
      const cards = drawn;
      if (cards) {
        AsyncStorage.setItem(TAROT_DATE_KEY, todayStr).catch(() => {});
        AsyncStorage.setItem(TAROT_CARDS_KEY, JSON.stringify(cards)).catch(() => {});
      }
      setAllowFlip(false);
    }
  };

  const showReading = revealed && drawn;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.screen}>
        <View style={styles.topBar}>
          <Text style={styles.topTitle}>Daily Tarot</Text>
          <PressableBounce onPress={onClose} scaleTo={0.85} style={styles.closeBtn}>
            <Text style={styles.closeText}>x</Text>
          </PressableBounce>
        </View>

        {loading ? (
          <View style={styles.drawPage}>
            <Text style={styles.hint}>加载中...</Text>
          </View>
        ) : showReading ? (
          <ScrollView
            style={styles.readScroll}
            contentContainerStyle={styles.readContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.cardRow}>
              {drawn!.map((r, i) => (
                <TarotCard
                  key={i}
                  data={r.card}
                  reversed={r.reversed}
                  position={r.position}
                  revealed
                  delay={i * 150}
                />
              ))}
            </View>

            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>{'\u2726'} 运势解读</Text>
              {drawn!.map((r, i) => (
                <View key={i} style={styles.summaryLine}>
                  <Text style={styles.summaryPos}>
                    {r.position} {'\u00B7'} {r.card.name}{r.reversed ? ' 逆位' : ' 正位'}
                  </Text>
                  <Text style={styles.summaryText}>
                    {r.reversed ? r.card.fortuneRev : r.card.fortune}
                  </Text>
                </View>
              ))}
              <Text style={styles.refreshNote}>零点刷新</Text>
            </View>
          </ScrollView>
        ) : drawn ? (
          <View style={styles.drawPage}>
            <Text style={styles.hint}>点击任意牌翻开</Text>
            <Text style={styles.subHint}>心中默念问题</Text>
            <View style={styles.cardRow}>
              {drawn.map((r, i) => (
                <PressableBounce key={i} onPress={handleDraw} scaleTo={0.93} style={styles.cardSlot}>
                  <View style={styles.cardBackPreview}>
                    <View style={styles.backInner}>
                      {[0,1,2].map(j => (
                        <View key={j} style={styles.backRow}>
                          {[0,1,2].map(k => (
                            <Text key={k} style={styles.backDiamond}>{'\u25C6'}</Text>
                          ))}
                        </View>
                      ))}
                    </View>
                  </View>
                  <Text style={styles.posLabel}>{r.position}</Text>
                </PressableBounce>
              ))}
            </View>
            <Text style={styles.refreshNote}>零点刷新</Text>
          </View>
        ) : (
          <View style={styles.drawPage}>
            <Text style={styles.hint}>加载中...</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bgDark,
    paddingTop: 44,
  },
  topBar: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  topTitle: {
    color: Colors.tarotGold,
    fontSize: 24,
    fontFamily: 'Caveat',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.cellBg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  closeText: { color: Colors.textMuted, fontSize: 18 },
  drawPage: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 8,
  },
  hint: { color: Colors.textMuted, fontSize: 13, marginBottom: 8 },
  subHint: { color: Colors.textMuted, fontSize: 10, marginBottom: 20, opacity: 0.6 },
  cardRow: { flexDirection: 'row' as const, gap: 6, paddingHorizontal: 4 },
  cardSlot: { flex: 1, alignItems: 'center' as const },
  cardBackPreview: {
    width: '100%',
    aspectRatio: 0.58,
    backgroundColor: Colors.tarotCardBack,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.tarotGold,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  backInner: { gap: 6 },
  backRow: { flexDirection: 'row' as const, gap: 6 },
  backDiamond: { color: Colors.tarotGold, fontSize: 10, opacity: 0.5 },
  posLabel: { color: Colors.textMuted, fontSize: 11, marginTop: 8 },
  readScroll: { flex: 1 },
  readContent: { flexGrow: 1, justifyContent: 'center' as const, paddingHorizontal: 8, paddingBottom: 40 },
  summary: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 14,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.tarotPurple,
    marginTop: 16,
  },
  summaryTitle: {
    color: Colors.tarotGold,
    fontSize: 15,
    fontFamily: 'Caveat',
    marginBottom: 12,
  },
  summaryLine: {
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  summaryPos: {
    color: Colors.tarotPurple,
    fontSize: 11,
    fontWeight: '600' as const,
    marginBottom: 3,
  },
  summaryText: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  refreshNote: {
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center' as const,
    marginTop: 12,
    opacity: 0.4,
  },
});
