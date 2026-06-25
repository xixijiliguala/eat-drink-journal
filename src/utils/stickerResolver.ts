import { getDrinkById, type Drink } from '../data/drinkLibrary';
import { getStickerCache } from './stickerCache';

export type ResolvedSticker = {
  drinkId: string;
  entryId: string;
  uri: string | null;
  emoji: string;
  brandColor: string;
  caption: string;
  kind: 'polaroid' | 'torn' | 'circle' | 'diecut';
  scale: number;
  offsetX: number;
  offsetY: number;
};

export function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

function jitter(min: number, max: number, seed: number): number {
  const h = Math.abs(hashCode(seed.toString()));
  const t = (h % 1000) / 1000;
  return min + t * (max - min);
}

export function resolveSticker(
  drinkId: string,
  entryId: string,
  label?: string,
  scale: number = 1,
  offsetX: number = 0,
  offsetY: number = 0
): ResolvedSticker {
  const cached = getStickerCache(drinkId);
  const isCustom = drinkId.startsWith('stkr_') || drinkId.startsWith('fav_');
  const drink: Drink | undefined = isCustom ? undefined : getDrinkById(drinkId);
  const safeScale = scale && scale > 0 ? scale : 1;

  return {
    drinkId,
    entryId,
    uri: cached,
    emoji: drink?.emoji ?? '🧋',
    brandColor: drink?.brandColor ?? '#5C4A3A',
    caption: label || drink?.name || '',
    kind: cached ? 'diecut' : 'polaroid',
    scale: safeScale,
    offsetX,
    offsetY,
  };
}

export function pickStickerSize(compact: boolean): number {
  return compact ? 42 : 54;
}

export function jitterFromEntry(
  entryId: string,
  baseRotationRange = 12,
  baseOffsetRange = 5
): { rotation: number; offsetX: number; offsetY: number } {
  return {
    rotation: -baseRotationRange + jitter(0, baseRotationRange * 2, hashCode(entryId)),
    offsetX: -baseOffsetRange + jitter(0, baseOffsetRange * 2, hashCode(entryId + 'x')),
    offsetY: -baseOffsetRange + jitter(0, baseOffsetRange * 2, hashCode(entryId + 'y')),
  };
}