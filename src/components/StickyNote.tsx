import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors, Shadows } from '../styles/colors';
import { FontFamily, FontSize, FontWeight, Radius, Spacing } from '../styles/tokens';

interface Props {
  message: string;
  rotation?: number;
  onSecretTap?: () => void;
}

export default function StickyNote({ message, rotation = -1.5, onSecretTap }: Props) {
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTap = () => {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    if (tapCount.current >= 4) {
      tapCount.current = 0;
      onSecretTap?.();
      return;
    }
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 1500);
  };

  return (
    <Pressable
      onPress={handleTap}
      style={[styles.wrap, { transform: [{ rotate: `${rotation}deg` }] }]}
    >
      <View style={styles.tape} />
      <View style={styles.note}>
        <Text style={styles.text}>{message}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  tape: {
    width: 80,
    height: 16,
    backgroundColor: Colors.tape,
    borderRadius: 1,
    marginBottom: -8,
    zIndex: 1,
    transform: [{ rotate: '3deg' }],
  },
  note: {
    backgroundColor: Colors.paper,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.sm,
    borderTopLeftRadius: 2,
    ...Shadows.sticker,
  },
  text: {
    color: Colors.textOnPaper,
    fontSize: FontSize.md,
    fontFamily: FontFamily.display,
    fontWeight: FontWeight.semibold,
  },
});