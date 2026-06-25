import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@drink_journal_device_id';

let cachedId: string | null = null;

export async function getDeviceId(): Promise<string> {
  if (cachedId) return cachedId;
  let id = await AsyncStorage.getItem(KEY);
  if (!id) {
    id = 'dj_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    await AsyncStorage.setItem(KEY, id);
  }
  cachedId = id;
  return id;
}
