const cache: Record<string, string> = {};

export function setStickerCache(entryId: string, base64: string) {
  cache[entryId] = base64;
}

export function getStickerCache(entryId: string): string | null {
  return cache[entryId] ?? null;
}
