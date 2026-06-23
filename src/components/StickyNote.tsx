import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Shadows } from '../styles/colors';

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
    <Pressable onPress={handleTap}>
      <View style={styles.note}>
        <Text style={styles.text}>{message}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  note: {
    backgroundColor: Colors.stickyNote,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
    alignSelf: 'center' as const,
    marginTop: 16,
    ...Shadows.sticker,
  },
  text: {
    color: Colors.stickyNoteText,
    fontSize: 14,
    fontFamily: 'Caveat',
  },
});
