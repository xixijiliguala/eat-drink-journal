import React from 'react';
import { View, Text, Image, StyleSheet, type ViewStyle, type ImageStyle } from 'react-native';
import { Colors, Shadows } from '../../styles/colors';
import { FontWeight } from '../../styles/tokens';

type StickerContentProps = {
  uri?: string | null;
  emoji?: string;
  brandColor?: string;
  size: number;
  style?: ViewStyle | ImageStyle;
};

export function StickerContent({ uri, emoji, brandColor, size, style }: StickerContentProps) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[{ width: size, height: size }, style as ImageStyle]}
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
        style as ViewStyle,
      ]}
    >
      <Text style={[styles.emoji, { fontSize: size * 0.78 }]} numberOfLines={1}>
        {emoji || '🧋'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emojiWrap: {
    borderRadius: 9999,
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