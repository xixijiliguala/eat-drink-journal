import React from 'react';
import { CircleSticker } from './CircleSticker';
import { PolaroidSticker } from './PolaroidSticker';
import { TornSticker } from './TornSticker';
import { DraggableSticker } from './DraggableSticker';
import { ZIndex } from '../../styles/tokens';

export type StickerKind = 'polaroid' | 'torn' | 'circle';

export type StickerData = {
  uri?: string | null;
  emoji?: string;
  brandColor?: string;
  caption?: string;
  size: number;
  rotation?: number;
  kind?: StickerKind;
  withTape?: boolean;
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
  const { kind = 'circle', size, draggable = false, rotation, ...rest } = props;

  const inner = (() => {
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

  if (!draggable) {
    return inner;
  }

  return (
    <DraggableSticker
      initialX={rest.initialX ?? 0}
      initialY={rest.initialY ?? 0}
      initialScale={rest.initialScale ?? 1}
      initialRotation={rest.initialRotation ?? rotation ?? 0}
      onTap={rest.onTap}
      onLongPress={rest.onLongPress}
      onPositionChange={rest.onPositionChange}
      onDragStart={rest.onDragStart}
      onDragEnd={rest.onDragEnd}
      style={{ zIndex: ZIndex.sticker }}
    >
      {inner}
    </DraggableSticker>
  );
}
