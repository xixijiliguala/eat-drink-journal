import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from 'react-native';

const BASE = 'https://YOUR-SERVER.example.com:PORT';

const SHARE_CODE_KEY = '@drink_journal_share_code';

function genShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function httpGet(url: string): Promise<any> {
  const raw = await NativeModules.MobileSAMModule.httpGet(url);
  return JSON.parse(raw);
}

async function httpPost(url: string, body: any): Promise<any> {
  const raw = await NativeModules.MobileSAMModule.httpPost(url, JSON.stringify(body));
  return JSON.parse(raw);
}

function apiGet(path: string, params: Record<string, string> = {}): Promise<any> {
  const qs = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  const url = qs ? `${BASE}${path}?${qs}` : `${BASE}${path}`;
  return httpGet(url);
}

export function initLC() {}

export async function getOrCreateShareCode(deviceId: string): Promise<string> {
  let code = await AsyncStorage.getItem(SHARE_CODE_KEY);
  if (code) return code;
  code = genShareCode();
  try {
    const res = await apiGet('/api/profile/register', { deviceId, shareCode: code });
    code = res.shareCode || code;
  } catch {}
  await AsyncStorage.setItem(SHARE_CODE_KEY, code);
  return code;
}

export async function setMyNickname(deviceId: string, nickname: string) {
  apiGet('/api/profile/register', { deviceId, nickname }).catch(() => {});
}

export async function getMyNickname(deviceId: string): Promise<string | null> {
  try {
    const res = await apiGet('/api/profile', { deviceId });
    return res?.nickname || null;
  } catch { return null; }
}

export interface FriendInfo { deviceId: string; nickname: string; avatar: string; }

export async function getMyFriends(deviceId: string): Promise<FriendInfo[]> {
  const res = await apiGet('/api/friends', { deviceId });
  return res || [];
}

export async function sendFriendRequest(fromId: string, shareCode: string, fromNickname: string): Promise<boolean> {
  const res = await apiGet('/api/friends/request2', { fromId, shareCode, fromNickname });
  return res.ok;
}

export interface PendingRequest { id: string; fromId: string; fromNickname: string; }

export async function getPendingRequests(deviceId: string): Promise<PendingRequest[]> {
  const res = await apiGet('/api/friends/requests', { deviceId });
  return res || [];
}

export async function acceptRequest(requestId: string) {
  await apiGet('/api/friends/accept', { requestId });
}

export async function rejectRequest(requestId: string) {
  await apiGet('/api/friends/reject', { requestId });
}

export interface FriendDrinkEntry { drinkId: string; label: string; imageUrl: string; }
export interface FriendToday { deviceId: string; nickname: string; entries: FriendDrinkEntry[]; avatar: string; }

export async function getFriendsTodayDrinks(friendIds: string[], date: string): Promise<FriendToday[]> {
  if (friendIds.length === 0) return [];
  const res = await apiGet('/api/drinks', { friendIds: friendIds.join(','), date });
  const list: FriendToday[] = res || [];
  for (const f of list) {
    for (const e of f.entries) {
      if (e.imageUrl) {
        try {
          const base64 = await NativeModules.MobileSAMModule.httpGetBase64(e.imageUrl);
          e.imageUrl = `data:image/png;base64,${base64}`;
        } catch {}
      }
    }
  }
  return list;
}

export async function migrateAccount(oldDeviceId: string, newDeviceId: string): Promise<boolean> {
  try {
    const res = await httpPost(`${BASE}/api/account/migrate`, { oldDeviceId, newDeviceId });
    return res.ok;
  } catch { return false; }
}

async function uploadStickerImage(base64: string): Promise<string> {
  const res = await httpPost(`${BASE}/api/upload/base64`, { image: base64 });
  return `${BASE}${res.url}`;
}

export async function syncTodayDrinks(
  deviceId: string,
  nickname: string,
  date: string,
  entries: { drinkId: string; label?: string }[],
  getStickerBase64: (drinkId: string) => string | null,
) {
  const uploadTasks = entries.map(async (e) => {
    let imageUrl = '';
    if (e.drinkId.startsWith('stkr_')) {
      const base64 = getStickerBase64(e.drinkId);
      if (base64) {
        try {
          imageUrl = await uploadStickerImage(base64);
        } catch {}
      }
    }
    return { drinkId: e.drinkId, label: e.label || '', imageUrl };
  });
  const uploadedEntries = await Promise.all(uploadTasks);
  await httpPost(`${BASE}/api/drinks`, {
    deviceId,
    nickname,
    date,
    entries: uploadedEntries,
  });
}
