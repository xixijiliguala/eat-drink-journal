import React, { useMemo } from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import Svg, { Defs, ClipPath, Path, Image as SvgImage, Rect } from 'react-native-svg';
import { Colors, Shadows } from '../../styles/colors';
import { FontSize, FontWeight, Spacing } from '../../styles/tokens';

type TornStickerProps = {
  uri?: string | null;
  emoji?: string;
  brandColor?: string;
  caption?: string;
  size: number;
  rotation?: number;
  withTape?: boolean;
  style?: ViewStyle;
};

function buildTornPath(size: number, jaggedness: number, seed: number): string {
  const segments = 18;
  const segW = size / segments;
  const rng = mulberry32(seed);
  let path = `M 0 0 `;
  for (let i = 1; i < segments; i++) {
    const x = i * segW;
    const dy = (rng() - 0.5) * jaggedness * 2;
    path += `L ${x.toFixed(2)} ${dy.toFixed(2)} `;
  }
  path += `L ${size} ${size} `;
  for (let i = segments - 1; i > 0; i--) {
    const x = i * segW;
    const dy = size - (rng() - 0.5) * jaggedness * 2;
    path += `L ${x.toFixed(2)} ${dy.toFixed(2)} `;
  }
  path += `L 0 0 Z`;
  return path;
}

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function TornSticker({
  uri,
  emoji,
  brandColor,
  caption,
  size,
  rotation = 0,
  withTape = false,
  style,
}: TornStickerProps) {
  const tornPath = useMemo(
    () => buildTornPath(size, Math.max(1.2, size * 0.025), size * 7 + 13),
    [size]
  );
  const clipId = useMemo(() => `torn-${Math.round(size)}-${Math.round(rotation * 10)}`, [size, rotation]);
  const pad = 6;
  const totalH = size + (caption ? size * 0.22 : 0) + pad * 2;

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size + pad * 2,
          height: totalH,
          transform: [{ rotate: `${rotation}deg` }],
        },
        style,
      ]}
    >
      <Svg width={size + pad * 2} height={size + pad * 2} style={styles.svg}>
        <Defs>
          <ClipPath id={clipId}>
            <Path d={tornPath} />
          </ClipPath>
        </Defs>
        <Rect x="0" y="0" width={size + pad * 2} height={size + pad * 2} fill={Colors.paper} />
        {uri ? (
          <SvgImage
            href={uri}
            x={pad}
            y={pad}
            width={size}
            height={size}
            clipPath={`url(#${clipId})`}
            preserveAspectRatio="xMidYMid slice"
          />
        ) : (
          <Rect x={pad} y={pad} width={size} height={size} clipPath={`url(#${clipId})`} fill={brandColor || Colors.brandGeneric} />
        )}
        {!uri ? (
          <View
            style={{
              position: 'absolute',
              left: pad,
              top: pad,
              width: size,
              height: size,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            pointerEvents="none"
          >
            <Text style={{ fontSize: size * 0.55 }}>{emoji || '🧋'}</Text>
          </View>
        ) : null}
      </Svg>

      {caption ? (
        <View style={styles.captionWrap}>
          <Text style={styles.caption} numberOfLines={1}>
            {caption}
          </Text>
        </View>
      ) : null}

      {withTape ? <TapeAccent width={(size + pad * 2) * 0.42} height={12} rotation={rotation} /> : null}
    </View>
  );
}

type TapeAccentProps = {
  width: number;
  height: number;
  rotation: number;
};

function TapeAccent({ width, height, rotation }: TapeAccentProps) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: -6,
        left: '50%',
        marginLeft: -width / 2,
        width,
        height,
        backgroundColor: Colors.tape,
        transform: [{ rotate: `${rotation + 8}deg` }],
        borderRadius: 1,
      }}
    />
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...Shadows.sticker,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  captionWrap: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  caption: {
    color: Colors.textOnPaper,
    fontSize: FontSize.xs,
    fontFamily: 'Caveat',
    fontWeight: FontWeight.semibold,
  },
});