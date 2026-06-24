import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { Colors, Shadows } from '../../styles/colors';
import { FontSize, FontWeight, Radius, Spacing } from '../../styles/tokens';
import { StickerContent } from './StickerContent';

type PolaroidStickerProps = {
  uri?: string | null;
  emoji?: string;
  brandColor?: string;
  caption?: string;
  size: number;
  rotation?: number;
  withTape?: boolean;
  style?: ViewStyle;
};

const BORDER_RATIO = 0.10;
const CAPTION_RATIO = 0.28;

export function PolaroidSticker({
  uri,
  emoji,
  brandColor,
  caption,
  size,
  rotation = 0,
  withTape = false,
  style,
}: PolaroidStickerProps) {
  const border = Math.max(6, size * BORDER_RATIO);
  const captionH = caption ? size * CAPTION_RATIO : 0;
  const photoSize = size;
  const width = photoSize + border * 2;
  const height = photoSize + border * 2 + captionH;

  return (
    <View
      style={[
        styles.wrap,
        {
          width,
          height,
          transform: [{ rotate: `${rotation}deg` }],
        },
        style,
      ]}
    >
      <View style={[styles.frame, { padding: border }]}>
        <StickerContent uri={uri} emoji={emoji} brandColor={brandColor} size={photoSize} />
        {caption ? (
          <View style={styles.captionWrap}>
            <Text style={styles.caption} numberOfLines={1}>
              {caption}
            </Text>
          </View>
        ) : null}
      </View>

      {withTape ? <WashiTape width={width * 0.45} height={14} tilt={rotation + 6} /> : null}
    </View>
  );
}

type WashiTapeProps = {
  width: number;
  height: number;
  tilt: number;
  top?: number;
  color?: string;
};

export function WashiTape({ width, height, tilt, top = -8, color = Colors.tape }: WashiTapeProps) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top,
        left: '50%',
        marginLeft: -width / 2,
        width,
        height,
        transform: [{ rotate: `${tilt}deg` }],
        opacity: 0.85,
      }}
    >
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="tape" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.9" />
            <Stop offset="0.5" stopColor={color} stopOpacity="0.7" />
            <Stop offset="1" stopColor={color} stopOpacity="0.9" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#tape)" rx="1" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...Shadows.polaroid,
  },
  frame: {
    flex: 1,
    backgroundColor: Colors.paper,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  captionWrap: {
    paddingTop: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
  },
  caption: {
    color: Colors.textOnPaper,
    fontSize: FontSize.xs,
    fontFamily: 'Caveat',
    fontWeight: FontWeight.semibold,
  },
});
