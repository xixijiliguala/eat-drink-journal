import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, Modal, ScrollView, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { Colors } from '../styles/colors';
import PressableBounce from './PressableBounce';
import AddFriendSheet from './AddFriendSheet';
import QRCodeModal from './QRCodeModal';
import FriendRow from './FriendRow';
import { formatDateKey } from '../utils/calendar';
import {
  getOrCreateShareCode, getMyFriends, getFriendsTodayDrinks,
  sendFriendRequest, getPendingRequests, acceptRequest, rejectRequest,
  getMyNickname,
  type FriendToday, type PendingRequest, type FriendInfo,
} from '../utils/serverApi';

interface Props {
  visible: boolean;
  myDeviceId: string;
  myNickname: string;
  onClose: () => void;
}

type Page = 'main' | 'add';

export default function FriendsModal({ visible, myDeviceId, myNickname, onClose }: Props) {
  const [page, setPage] = useState<Page>('main');
  const [friends, setFriends] = useState<FriendInfo[]>([]);
  const [todayDrinks, setTodayDrinks] = useState<FriendToday[]>([]);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [shareCode, setShareCode] = useState('');

  const loadData = useCallback(async () => {
    const code = await getOrCreateShareCode(myDeviceId);
    setShareCode(code);
    setLoading(true);
    try {
      const today = formatDateKey(new Date());
      const [list, reqs] = await Promise.all([
        getMyFriends(myDeviceId),
        getPendingRequests(myDeviceId),
      ]);
      setFriends(list);
      setPending(reqs);
      if (list.length > 0) {
        const drinks = await getFriendsTodayDrinks(list.map((f) => f.deviceId), today);
        setTodayDrinks(drinks);
      }
    } catch (e: any) {
      Alert.alert('加载失败', e?.message || String(e));
    }
    setLoading(false);
  }, [myDeviceId]);

  useEffect(() => {
    if (visible) { setPage('main'); loadData(); }
  }, [visible, loadData]);

  const handleAddByCode = async (code: string): Promise<boolean> => {
    try {
      const name = (await getMyNickname(myDeviceId)) || myNickname || '好友';
      const ok = await sendFriendRequest(myDeviceId, code, name);
      if (!ok) { Alert.alert('未找到', `好友码 ${code} 不存在`); return false; }
      return true;
    } catch (e: any) {
      Alert.alert('网络错误', e?.message || String(e));
      return false;
    }
  };

  const handleAccept = async (reqId: string) => {
    try {
      await acceptRequest(reqId);
      Alert.alert('已添加', '你们现在是好友了');
      loadData();
    } catch (e: any) { Alert.alert('错误', e?.message || '失败'); }
  };

  const handleReject = async (reqId: string) => {
    try { await rejectRequest(reqId); loadData(); } catch {}
  };

  const Short = shareCode || '...';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.backdrop}><PressableBounce onPress={onClose} style={{ flex: 1 }} /></View>
        <View style={styles.sheet}>
          {page === 'main' ? (<>
            <View style={styles.topBar}>
              <Text style={styles.title}>好友</Text>
              <PressableBounce onPress={onClose} scaleTo={0.85} style={styles.cb}><Text style={styles.cx}>✕</Text></PressableBounce>
            </View>
            <View style={styles.mc}>
              <Text style={styles.cl}>我的好友码</Text>
              <Text style={styles.cv}>{Short}</Text>
            </View>
            {friends.length === 0 && !loading && (
              <View style={styles.em}><Text style={styles.et}>还没有好友</Text><Text style={styles.eh}>点击下方按钮添加</Text></View>
            )}
            {loading ? <ActivityIndicator color={Colors.tarotGold} style={{ marginTop: 20 }} /> : (
              <ScrollView style={styles.fl} showsVerticalScrollIndicator={false}>
                {friends.map((f) => {
                  const td = todayDrinks.find((t) => t.deviceId === f.deviceId);
                  return <FriendRow key={f.deviceId} friend={{ deviceId: f.deviceId, nickname: f.nickname, entries: td?.entries || [], avatar: f.avatar || '' }} />;
                })}
              </ScrollView>
            )}
            <View style={styles.bb}>
              <PressableBounce onPress={() => setPage('add')} scaleTo={0.92} style={styles.ab}><Text style={styles.at}>+ 添加好友</Text></PressableBounce>
              {pending.length > 0 && <Text style={styles.ph}>{pending.length} 个待处理</Text>}
            </View>
          </>) : (<>
            <View style={styles.topBar}>
              <PressableBounce onPress={() => setPage('main')} scaleTo={0.85}><Text style={styles.bt}>← 返回</Text></PressableBounce>
              <Text style={styles.title}>添加好友</Text><View style={{ width: 40 }} />
            </View>
            <AddFriendSheet
              myCode={Short} pendingRequests={pending} onAddByCode={handleAddByCode}
              onAccept={handleAccept} onReject={handleReject} onShowQR={() => setQrVisible(true)}
            />
          </>)}
        </View>
      </View>
      <QRCodeModal visible={qrVisible} code={Short} onClose={() => setQrVisible(false)} />
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  sheet: { backgroundColor: Colors.cardBg, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingBottom: 36, paddingTop: 14, height: '75%', minHeight: 500 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { color: Colors.white, fontSize: 18, fontWeight: '600' },
  cb: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.cellBg, alignItems: 'center', justifyContent: 'center' },
  cx: { color: Colors.textMuted, fontSize: 16 },
  bt: { color: Colors.textSecondary, fontSize: 16 },
  mc: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.cellBg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14 },
  cl: { color: Colors.textSecondary, fontSize: 13 },
  cv: { color: Colors.tarotGold, fontSize: 16, fontWeight: 'bold', letterSpacing: 2 },
  fl: { flex: 1 },
  em: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  et: { color: Colors.textMuted, fontSize: 15, marginBottom: 4 },
  eh: { color: Colors.textMuted, fontSize: 12, opacity: 0.6 },
  bb: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  ab: { backgroundColor: Colors.tarotPurple, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 },
  at: { color: Colors.white, fontSize: 15, fontWeight: '600' },
  ph: { color: Colors.tarotGold, fontSize: 12 },
});
