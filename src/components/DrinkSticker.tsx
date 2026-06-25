import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { type Drink } from '../data/drinkLibrary';
import { Colors, Shadows } from '../styles/colors';

interface Props {
  drink: Drink;
  size?: number;
  onPress?: () => void;
  onLongPress?: () => void;
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h;
}

export default function DrinkSticker({
  drink,
  size = 20,
  onPress,
  onLongPress,
}: Props) {
  const rotation = (hashCode(drink.id) % 10) - 5;

  return (
    <View
      style={[
        styles.sticker,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: drink.brandColor,
          transform: [{ rotate: `${rotation}deg` }],
        },
      ]}
    >
      <Text
        style={[styles.emoji, { fontSize: size * 0.6 }]}
        numberOfLines={1}
      >
        {drink.emoji}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sticker: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 1.5,
    borderColor: Colors.white,
    ...Shadows.sticker,
  },
  emoji: {
    textAlign: 'center' as const,
  },
});
