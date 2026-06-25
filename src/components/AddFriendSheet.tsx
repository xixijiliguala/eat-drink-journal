import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Alert } from 'react-native';
import { Colors } from '../styles/colors';
import PressableBounce from './PressableBounce';
import type { PendingRequest } from '../utils/serverApi';

interface Props {
  myCode: string;
  pendingRequests: PendingRequest[];
  onAddByCode: (code: string) => Promise<boolean>;
  onAccept: (requestId: string) => Promise<void>;
  onReject: (requestId: string) => Promise<void>;
  onShowQR: () => void;
}

export default function AddFriendSheet({
  myCode,
  pendingRequests,
  onAddByCode,
  onAccept,
  onReject,
  onShowQR,
}: Props) {
  const [inputCode, setInputCode] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    const trimmed = inputCode.trim();
    if (trimmed.length < 2) {
      Alert.alert('提示', '请输入有效的好友码');
      return;
    }
    if (trimmed === myCode) {
      Alert.alert('提示', '不能添加自己为好友');
      return;
    }
    setAdding(true);
    const ok = await onAddByCode(trimmed);
    if (ok) {
      setInputCode('');
      Alert.alert('已发送', '好友请求已发送，等待对方确认');
    }
    setAdding(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputArea}>
        <Text style={styles.sectionTitle}>输入好友码</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.codeInput}
            value={inputCode}
            onChangeText={setInputCode}
            placeholder="输入好友码"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="none"
            maxLength={20}
          />
          <PressableBounce
            onPress={handleAdd}
            scaleTo={0.9}
            disabled={adding || inputCode.trim().length < 2}
            style={[
              styles.addBtn,
              (adding || inputCode.trim().length < 2) && styles.addBtnDisabled,
            ]}
          >
            <Text style={styles.addBtnText}>{adding ? '...' : '添加'}</Text>
          </PressableBounce>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.myCodeArea}>
        <Text style={styles.sectionTitle}>我的好友码</Text>
        <Text style={styles.hint}>让好友输入此码或扫描二维码添加你</Text>
        <View style={styles.codeRow}>
          <Text style={styles.myCodeText}>{myCode}</Text>
          <PressableBounce onPress={onShowQR} scaleTo={0.9} style={styles.qrBtn}>
            <Text style={styles.qrBtnText}>查看二维码</Text>
          </PressableBounce>
        </View>
      </View>

      {pendingRequests.length > 0 && (
        <View style={styles.requestsArea}>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>待处理请求 ({pendingRequests.length})</Text>
          <ScrollView style={styles.requestsList}>
            {pendingRequests.map((req) => (
              <View key={req.id} style={styles.requestRow}>
                <Text style={styles.requestName}>{req.fromNickname} 想加你为好友</Text>
                <View style={styles.requestBtns}>
                  <PressableBounce onPress={() => onAccept(req.id)} scaleTo={0.9} style={styles.acceptBtn}>
                    <Text style={styles.acceptText}>接受</Text>
                  </PressableBounce>
                  <PressableBounce onPress={() => onReject(req.id)} scaleTo={0.9} style={styles.rejectBtn}>
                    <Text style={styles.rejectText}>拒绝</Text>
                  </PressableBounce>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionTitle: {
    color: Colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 8,
  },
  hint: {
    color: Colors.textMuted, fontSize: 11, marginBottom: 8, opacity: 0.7,
  },
  inputArea: { marginBottom: 12 },
  inputRow: { flexDirection: 'row', gap: 8 },
  codeInput: {
    flex: 1, color: Colors.white, fontSize: 14,
    backgroundColor: Colors.cellBg, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  addBtn: {
    backgroundColor: Colors.tarotPurple, borderRadius: 12,
    paddingHorizontal: 20, justifyContent: 'center',
  },
  addBtnDisabled: { opacity: 0.4 },
  addBtnText: { color: Colors.white, fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 14 },
  myCodeArea: { marginBottom: 12 },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  myCodeText: {
    color: Colors.tarotGold, fontSize: 18, fontWeight: 'bold', letterSpacing: 2,
  },
  qrBtn: {
    backgroundColor: Colors.cellBg, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.tarotGold,
  },
  qrBtnText: { color: Colors.tarotGold, fontSize: 12 },
  requestsArea: { flex: 1 },
  requestsList: { flex: 1 },
  requestRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border,
  },
  requestName: { color: Colors.white, fontSize: 13, flex: 1 },
  requestBtns: { flexDirection: 'row', gap: 8 },
  acceptBtn: {
    backgroundColor: Colors.tarotPurple, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  acceptText: { color: Colors.white, fontSize: 12, fontWeight: '600' },
  rejectBtn: {
    backgroundColor: Colors.cellBg, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  rejectText: { color: Colors.textMuted, fontSize: 12 },
});
