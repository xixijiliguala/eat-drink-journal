import React from 'react';
import { View, Image, StyleSheet, type ViewStyle } from 'react-native';
import { Shadows } from '../../styles/colors';
import { WashiTape } from './PolaroidSticker';

type DieCutStickerProps = {
  uri: string;
  size: number;
  rotation?: number;
  scale?: number;
  offsetX?: number;
  offsetY?: number;
  withTape?: boolean;
  style?: ViewStyle;
};

export function DieCutSticker({
  uri,
  size,
  rotation = 0,
  scale = 1,
  offsetX = 0,
  offsetY = 0,
  withTape = true,
  style,
}: DieCutStickerProps) {
  const clamped = Math.max(0.2, Math.min(2.4, scale));
  const imgSize = size * clamped;

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          transform: [{ rotate: `${rotation}deg` }],
        },
        style,
      ]}
      pointerEvents="none"
    >
      {withTape ? (
        <WashiTape
          width={size * 0.5}
          height={Math.max(8, size * 0.12)}
          tilt={rotation + 6}
          top={-Math.max(3, size * 0.08)}
        />
      ) : null}
      <View
        style={{
          width: imgSize,
          height: imgSize,
          transform: [
            { translateX: offsetX * size },
            { translateY: offsetY * size },
          ],
        }}
      >
        <Image
          source={{ uri }}
          style={{ width: imgSize, height: imgSize }}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    ...Shadows.sticker,
  },
});