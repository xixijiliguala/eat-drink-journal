import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors, Shadows } from '../../styles/colors';
import { FontSize, FontWeight, Radius } from '../../styles/tokens';

type StickerContentProps = {
  uri?: string | null;
  emoji?: string;
  brandColor?: string;
  size: number;
};

export function StickerContent({ uri, emoji, brandColor, size }: StickerContentProps) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size }}
        resizeMode="cover"
      />
    );
  }
  return (
    <View
      style={[
        styles.emojiWrap,
        {
          width: size,
          height: size,
          backgroundColor: brandColor || Colors.brandGeneric,
        },
      ]}
    >
      <Text style={[styles.emoji, { fontSize: size * 0.6 }]} numberOfLines={1}>
        {emoji || '🧋'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emojiWrap: {
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Shadows.inset,
  },
  emoji: {
    textAlign: 'center',
    fontWeight: FontWeight.semibold,
  },
});
