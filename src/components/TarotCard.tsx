import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, Image, StyleSheet } from 'react-native';
import { type TarotCard as TarotCardData } from '../data/tarotCards';
import { tarotImageMap, getImageFile } from '../data/tarotImages';
import { Colors } from '../styles/colors';

interface Props {
  data: TarotCardData;
  reversed: boolean;
  position: string;
  revealed: boolean;
  delay: number;
}

export default function TarotCard({ data, reversed, position, revealed, delay }: Props) {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const hasStarted = useRef(false);

  useEffect(() => {
    if (revealed && !hasStarted.current) {
      hasStarted.current = true;
      Animated.timing(flipAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }).start();
    }
  }, [revealed, delay, flipAnim]);

  const frontInterp = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '90deg', '180deg'],
  });
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.45, 0.5],
    outputRange: [1, 1, 0],
  });
  const backInterp = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['180deg', '270deg', '360deg'],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0.5, 0.55, 1],
    outputRange: [0, 1, 1],
  });

  const imgFile = getImageFile(data.type, data.imgIdx, data.suit, data.number);
  const imgSource = imgFile ? tarotImageMap[imgFile] : null;

  return (
    <View style={styles.container}>
      <View style={styles.cardStage}>
        <Animated.View
          style={[
            styles.face,
            styles.faceBack,
            { opacity: frontOpacity, transform: [{ rotateY: frontInterp }] },
          ]}
        >
          <View style={styles.backInner}>
            {[0,1,2].map(j => (
              <View key={j} style={styles.backRow}>
                {[0,1,2].map(k => (
                  <Text key={k} style={styles.backDiamond}>◆</Text>
                ))}
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.face,
            styles.faceFront,
            { opacity: backOpacity, transform: [{ rotateY: backInterp }] },
          ]}
        >
          {imgSource ? (
            <Image source={imgSource} style={styles.cardImg} resizeMode="contain" />
          ) : (
            <View style={styles.noImg}>
              <Text style={styles.minorEmoji}>{data.emoji}</Text>
            </View>
          )}
          <View style={styles.labelBar}>
            <Text style={styles.labelName}>{data.name}</Text>
            <View style={[styles.posBadge, reversed && styles.posBadgeRev]}>
              <Text style={styles.posText}>{position}{reversed ? ' 逆' : ''}</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginHorizontal: 3 },
  cardStage: { width: '100%', aspectRatio: 0.58 },
  face: {
    position: 'absolute' as const, width: '100%', height: '100%',
    borderRadius: 10, backfaceVisibility: 'hidden' as const, overflow: 'hidden' as const,
  },
  faceBack: {
    backgroundColor: Colors.tarotCardBack, borderWidth: 2, borderColor: Colors.tarotGold,
    alignItems: 'center' as const, justifyContent: 'center' as const,
  },
  backInner: { gap: 6 },
  backRow: { flexDirection: 'row' as const, gap: 6 },
  backDiamond: { color: Colors.tarotGold, fontSize: 10, opacity: 0.5 },
  faceFront: {
    backgroundColor: '#1A1513', borderWidth: 2, borderColor: Colors.tarotGold,
  },
  cardImg: { flex: 1, width: '100%' },
  noImg: { flex: 1, alignItems: 'center' as const, justifyContent: 'center' as const },
  minorEmoji: { fontSize: 36 },
  labelBar: {
    backgroundColor: 'rgba(0,0,0,0.75)', paddingVertical: 6, paddingHorizontal: 6,
    alignItems: 'center' as const, gap: 2,
  },
  labelName: { color: Colors.white, fontSize: 12, fontWeight: 'bold' as const },
  posBadge: { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 6, backgroundColor: Colors.tarotPurple },
  posBadgeRev: { backgroundColor: Colors.danger },
  posText: { color: Colors.white, fontSize: 9, fontWeight: '600' as const },
});
