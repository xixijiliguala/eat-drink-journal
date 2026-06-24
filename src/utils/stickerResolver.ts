import { getDrinkById, type Drink } from '../data/drinkLibrary';
import { getStickerCache } from './stickerCache';

export type ResolvedSticker = {
  drinkId: string;
  entryId: string;
  uri: string | null;
  emoji: string;
  brandColor: string;
  caption: string;
  kind: 'polaroid' | 'torn' | 'circle';
};

const KIND_BY_DRINK: Record<string, 'polaroid' | 'torn' | 'circle'> = {
  'starbucks-latte': 'circle',
  'starbucks-americano': 'circle',
  'starbucks-matcha': 'torn',
  'starbucks-flatwhite': 'torn',
  'luckin-coconut': 'torn',
  'luckin-maotai': 'polaroid',
  'luckin-orange': 'torn',
  'luckin-thick': 'circle',
  'heytea-grape': 'torn',
  'heytea-peach': 'polaroid',
  'heytea-lemon': 'torn',
  'heytea-green': 'torn',
  'mixue-lemonade': 'circle',
  'mixue-cone': 'circle',
  'mixue-peach-spring': 'torn',
  'mixue-bubble': 'circle',
  'generic-latte': 'circle',
  'generic-americano': 'circle',
  'generic-mocha': 'circle',
  'generic-coldbrew': 'circle',
  'generic-bubble-milk': 'circle',
  'generic-coconut-jelly': 'torn',
  'generic-pudding': 'torn',
  'generic-roasted': 'torn',
  'generic-passion': 'torn',
  'generic-mango': 'torn',
  'generic-strawberry': 'torn',
  'generic-orange-juice': 'circle',
  'generic-watermelon': 'torn',
  'generic-coconut-water': 'torn',
  'generic-soda': 'circle',
  'generic-cola': 'circle',
};

function hashCode(s: string): number {
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
  label?: string
): ResolvedSticker {
  const cached = getStickerCache(drinkId);
  const isCustom = drinkId.startsWith('stkr_') || drinkId.startsWith('fav_');
  const drink: Drink | undefined = isCustom ? undefined : getDrinkById(drinkId);

  let kind: 'polaroid' | 'torn' | 'circle';
  if (isCustom) {
    kind = (['polaroid', 'torn', 'circle'] as const)[Math.abs(hashCode(entryId)) % 3];
  } else {
    kind = KIND_BY_DRINK[drinkId] ?? 'circle';
  }

  const baseRotation = jitter(-6, 6, hashCode(drinkId + entryId));
  return {
    drinkId,
    entryId,
    uri: cached,
    emoji: drink?.emoji ?? '🧋',
    brandColor: drink?.brandColor ?? '#5C4A3A',
    caption: label || drink?.name || '',
    kind,
  };
}

export function pickStickerSize(compact: boolean): number {
  return compact ? 40 : 50;
}

export { hashCode };
