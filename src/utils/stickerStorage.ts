import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { setStickerCache } from './stickerCache';

const STICKER_KEY = '@drink_journal_custom_stickers';
const SAVED_KEY = '@drink_journal_saved_stickers';
const STICKER_DIR = `${FileSystem.documentDirectory}stickers/`;

export interface CustomSticker {
  id: string;
  filePath: string;
  label?: string;
  createdAt: number;
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

async function ensureDir() {
  const dirInfo = await FileSystem.getInfoAsync(STICKER_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(STICKER_DIR, { intermediates: true });
  }
}

async function saveBase64ToFile(base64: string, id: string): Promise<string> {
  await ensureDir();
  const filePath = `${STICKER_DIR}${id}.png`;
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  await FileSystem.writeAsStringAsync(filePath, base64Data, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return filePath;
}

async function loadBase64FromFile(filePath: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(filePath, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return `data:image/png;base64,${base64}`;
}

async function loadStickers(): Promise<CustomSticker[]> {
  const raw = await AsyncStorage.getItem(STICKER_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export async function initCacheFromStorage(): Promise<void> {
  await ensureDir();
  const stickers = await loadStickers();
  for (const s of stickers) {
    try {
      const base64 = await loadBase64FromFile(s.filePath);
      setStickerCache(s.id, base64);
    } catch {}
  }
  const saved = await loadSavedStickers();
  for (const s of saved) {
    try {
      const base64 = await loadBase64FromFile(s.filePath);
      setStickerCache(s.id, base64);
    } catch {}
  }
}

export async function saveSticker(base64: string): Promise<CustomSticker> {
  const stickers = await loadStickers();
  const id = genId();
  const filePath = await saveBase64ToFile(base64, id);
  const sticker: CustomSticker = { id, filePath, createdAt: Date.now() };
  stickers.push(sticker);
  if (stickers.length > 50) {
    const removed = stickers.splice(0, stickers.length - 50);
    for (const r of removed) {
      try { await FileSystem.deleteAsync(r.filePath, { idempotent: true }); } catch {}
    }
  }
  await AsyncStorage.setItem(STICKER_KEY, JSON.stringify(stickers));
  return sticker;
}

export async function saveStickerWithId(id: string, base64: string, label?: string): Promise<void> {
  const stickers = await loadStickers();
  if (!stickers.find((s) => s.id === id)) {
    const filePath = await saveBase64ToFile(base64, id);
    stickers.push({ id, filePath, label: label?.trim() || undefined, createdAt: Date.now() });
  }
  if (stickers.length > 50) {
    const removed = stickers.splice(0, stickers.length - 50);
    for (const r of removed) {
      try { await FileSystem.deleteAsync(r.filePath, { idempotent: true }); } catch {}
    }
  }
  await AsyncStorage.setItem(STICKER_KEY, JSON.stringify(stickers));
  setStickerCache(id, base64);
}

export async function loadSavedStickers(): Promise<CustomSticker[]> {
  const raw = await AsyncStorage.getItem(SAVED_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export async function saveAsFavorite(savedId: string, base64: string, label?: string): Promise<void> {
  const saved = await loadSavedStickers();
  if (saved.find((s) => s.id === savedId)) return;
  const filePath = await saveBase64ToFile(base64, savedId);
  saved.push({ id: savedId, filePath, label: label?.trim() || undefined, createdAt: Date.now() });
  if (saved.length > 30) {
    const removed = saved.splice(0, saved.length - 30);
    for (const r of removed) {
      try { await FileSystem.deleteAsync(r.filePath, { idempotent: true }); } catch {}
    }
  }
  await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(saved));
  setStickerCache(savedId, base64);
}

export async function deleteSavedSticker(id: string): Promise<void> {
  const saved = await loadSavedStickers();
  const target = saved.find((s) => s.id === id);
  const filtered = saved.filter((s) => s.id !== id);
  await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(filtered));
  if (target) {
    try { await FileSystem.deleteAsync(target.filePath, { idempotent: true }); } catch {}
  }
}
