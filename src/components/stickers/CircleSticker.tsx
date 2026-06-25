import React from 'react';
import { View, Text, Image, StyleSheet, type ViewStyle } from 'react-native';
import { Colors, Shadows } from '../../styles/colors';
import { FontWeight } from '../../styles/tokens';

type CircleStickerProps = {
  uri?: string | null;
  emoji?: string;
  brandColor?: string;
  size: number;
  rotation?: number;
  bordered?: boolean;
  style?: ViewStyle;
};

export function CircleSticker({
  uri,
  emoji,
  brandColor,
  size,
  rotation = 0,
  bordered = true,
  style,
}: CircleStickerProps) {
  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: brandColor || Colors.brandGeneric,
          transform: [{ rotate: `${rotation}deg` }],
          borderWidth: bordered ? Math.max(1, size * 0.06) : 0,
        },
        style,
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={styles.img} resizeMode="cover" />
      ) : (
        <Text style={[styles.emoji, { fontSize: size * 0.55 }]} numberOfLines={1}>
          {emoji || '🧋'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: Colors.paper,
    overflow: 'hidden',
    ...Shadows.sticker,
  },
  img: {
    width: '100%',
    height: '100%',
  },
  emoji: {
    textAlign: 'center',
    fontWeight: FontWeight.semibold,
  },
});