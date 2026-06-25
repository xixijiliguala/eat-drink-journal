import React from 'react';
import { Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CircleSticker } from './CircleSticker';
import { PolaroidSticker } from './PolaroidSticker';
import { TornSticker } from './TornSticker';
import { DieCutSticker } from './DieCutSticker';

export type StickerKind = 'polaroid' | 'torn' | 'circle' | 'diecut';

export type StickerData = {
  uri?: string | null;
  emoji?: string;
  brandColor?: string;
  caption?: string;
  size: number;
  rotation?: number;
  kind?: StickerKind;
  withTape?: boolean;
  scale?: number;
  offsetX?: number;
  offsetY?: number;
};

type StickerRendererProps = StickerData & {
  draggable?: boolean;
  initialX?: number;
  initialY?: number;
  initialScale?: number;
  initialRotation?: number;
  onTap?: () => void;
  onLongPress?: () => void;
  onPositionChange?: (state: { x: number; y: number; scale: number; rotation: number }) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
};

export function StickerRenderer(props: StickerRendererProps) {
  const { kind = 'circle', size, draggable = false, rotation, onTap, onLongPress, ...rest } = props;

  const inner = (() => {
    if (kind === 'diecut') {
      return (
        <DieCutSticker
          uri={rest.uri ?? ''}
          size={size}
          rotation={draggable ? 0 : rotation ?? 0}
          scale={rest.scale ?? 1}
          offsetX={rest.offsetX ?? 0}
          offsetY={rest.offsetY ?? 0}
          withTape={rest.withTape ?? true}
        />
      );
    }
    if (kind === 'polaroid') {
      return (
        <PolaroidSticker
          uri={rest.uri}
          emoji={rest.emoji}
          brandColor={rest.brandColor}
          caption={rest.caption}
          size={size}
          rotation={draggable ? 0 : rotation ?? 0}
          withTape={rest.withTape ?? true}
        />
      );
    }
    if (kind === 'torn') {
      return (
        <TornSticker
          uri={rest.uri}
          emoji={rest.emoji}
          brandColor={rest.brandColor}
          caption={rest.caption}
          size={size}
          rotation={draggable ? 0 : rotation ?? 0}
          withTape={rest.withTape ?? true}
        />
      );
    }
    return (
      <CircleSticker
        uri={rest.uri}
        emoji={rest.emoji}
        brandColor={rest.brandColor}
        size={size}
        rotation={draggable ? 0 : rotation ?? 0}
      />
    );
  })();

  const tap = onTap
    ? () => {
        Haptics.selectionAsync().catch(() => {});
        onTap();
      }
    : undefined;
  const long = onLongPress
    ? () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onLongPress();
      }
    : undefined;

  if (!tap && !long) {
    return inner;
  }

  return (
    <Pressable
      onPress={tap}
      onLongPress={long}
      delayLongPress={380}
      hitSlop={6}
    >
      {inner}
    </Pressable>
  );
}