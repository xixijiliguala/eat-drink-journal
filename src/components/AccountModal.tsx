import React, { useState, useEffect } from 'react';
import {
  View, Text, Modal, TextInput, ScrollView, StyleSheet, Alert, NativeModules,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Colors } from '../styles/colors';
import PressableBounce from './PressableBounce';
import { migrateAccount, setMyNickname } from '../utils/serverApi';

const NICKNAME_KEY = '@drink_journal_nickname';
const AVATAR_KEY = '@drink_journal_avatar';
const DEVICE_ID_KEY = '@drink_journal_device_id';

const EMOJI_AVATARS = [
  '😀','😎','🤩','🥳','😇','🤠','🦊','🐱','🐶','🐼',
  '🐨','🐸','🦄','🐙','🍉','🍓','🍕','🎸','🌟','🔥',
  '💎','🎀','🌻','🍀','🌙','⚡','🎯','🎲','👑','💀',
];

interface Props {
  visible: boolean;
  myDeviceId: string;
  myNickname: string;
  myAvatar: string;
  onClose: () => void;
  onNicknameChange: (name: string) => void;
  onAvatarChange: (emoji: string) => void;
}

export default function AccountModal({
  visible,
  myDeviceId,
  myNickname,
  myAvatar,
  onClose,
  onNicknameChange,
  onAvatarChange,
}: Props) {
  const [nickname, setNickname] = useState(myNickname);
  const [avatar, setAvatar] = useState(myAvatar);
  const [restoreId, setRestoreId] = useState('');
  const [restoring, setRestoring] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (visible) {
      setNickname(myNickname);
      setAvatar(myAvatar);
    }
  }, [visible, myNickname, myAvatar]);

  const handleSaveNickname = async () => {
    const trimmed = nickname.trim();
    if (trimmed && trimmed !== myNickname) {
      await AsyncStorage.setItem(NICKNAME_KEY, trimmed);
      onNicknameChange(trimmed);
      setMyNickname(myDeviceId, trimmed).catch(() => {});
    }
  };

  const handleSelectAvatar = async (emoji: string) => {
    setAvatar(emoji);
    await AsyncStorage.setItem(AVATAR_KEY, emoji);
    onAvatarChange(emoji);
    const url = `https://YOUR-SERVER.example.com:PORT/api/profile/register?deviceId=${encodeURIComponent(myDeviceId)}&avatar=${encodeURIComponent(emoji)}`;
    NativeModules.MobileSAMModule.httpGet(url);
    setShowAvatarPicker(false);
  };

  const handleRestore = async () => {
    const input = restoreId.trim();
    if (!input) { Alert.alert('提示', '请输入要恢复的账号ID'); return; }
    if (input === myDeviceId) { Alert.alert('提示', '输入的就是当前账号'); return; }
    setRestoring(true);
    const ok = await migrateAccount(input, myDeviceId);
    if (ok) {
      await AsyncStorage.setItem(DEVICE_ID_KEY, myDeviceId);
      Alert.alert('成功', '数据已迁移，重启APP生效');
    } else {
      Alert.alert('失败', '账号ID不存在或已被占用');
    }
    setRestoring(false);
    setRestoreId('');
  };

  const handleCopyId = async () => {
    await Clipboard.setStringAsync(myDeviceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.backdrop}>
          <PressableBounce onPress={onClose} style={{ flex: 1 }} />
        </View>
        <View style={styles.sheet}>
          <View style={styles.topBar}>
            <Text style={styles.title}>账号设置</Text>
            <PressableBounce onPress={onClose} scaleTo={0.85} style={styles.closeBtn}>
              <Text style={styles.closeX}>✕</Text>
            </PressableBounce>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>头像</Text>
            <PressableBounce onPress={() => setShowAvatarPicker(!showAvatarPicker)} scaleTo={0.95}>
              <View style={styles.avatarPreview}>
                <Text style={styles.avatarEmoji}>{avatar || '👤'}</Text>
                <Text style={styles.avatarHint}>点击选择头像</Text>
              </View>
            </PressableBounce>

            {showAvatarPicker && (
              <View style={styles.emojiGrid}>
                {EMOJI_AVATARS.map((e) => (
                  <PressableBounce key={e} onPress={() => handleSelectAvatar(e)} scaleTo={0.85}>
                    <Text style={styles.emojiItem}>{e}</Text>
                  </PressableBounce>
                ))}
              </View>
            )}

            <Text style={styles.sectionTitle}>昵称</Text>
            <View style={styles.nickRow}>
              <TextInput
                style={styles.input}
                value={nickname}
                onChangeText={setNickname}
                placeholder="输入昵称"
                placeholderTextColor={Colors.textMuted}
                maxLength={10}
              />
              <PressableBounce onPress={handleSaveNickname} scaleTo={0.92} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>保存</Text>
              </PressableBounce>
            </View>

            <Text style={styles.sectionTitle}>账号ID</Text>
            <View style={styles.idRow}>
              <Text style={styles.idText} numberOfLines={1}>{myDeviceId}</Text>
              <PressableBounce onPress={handleCopyId} scaleTo={0.9} style={styles.copyBtn}>
                <Text style={styles.copyBtnText}>{copied ? '已复制' : '复制'}</Text>
              </PressableBounce>
            </View>
            <Text style={styles.idHint}>保存此ID，换手机或重装后可恢复所有数据</Text>

            <Text style={styles.sectionTitle}>恢复账号</Text>
            <View style={styles.restoreRow}>
              <TextInput
                style={styles.input}
                value={restoreId}
                onChangeText={setRestoreId}
                placeholder="输入旧账号ID"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
              />
              <PressableBounce
                onPress={handleRestore}
                scaleTo={0.92}
                disabled={restoring || !restoreId.trim()}
                style={[styles.restoreBtn, (restoring || !restoreId.trim()) && styles.restoreBtnDisabled]}
              >
                <Text style={styles.restoreBtnText}>{restoring ? '...' : '恢复'}</Text>
              </PressableBounce>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  sheet: {
    backgroundColor: Colors.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 14,
    height: '80%',
    minHeight: 500,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: { color: Colors.white, fontSize: 18, fontWeight: '600' },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.cellBg, alignItems: 'center', justifyContent: 'center' },
  closeX: { color: Colors.textMuted, fontSize: 16 },
  body: { flex: 1 },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  avatarPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cellBg,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  avatarEmoji: { fontSize: 36 },
  avatarHint: { color: Colors.textMuted, fontSize: 13 },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: Colors.cellBg,
    borderRadius: 12,
  },
  emojiItem: { fontSize: 28, padding: 6 },
  nickRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    color: Colors.white,
    fontSize: 14,
    backgroundColor: Colors.cellBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  saveBtn: {
    backgroundColor: Colors.tarotPurple,
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  saveBtnText: { color: Colors.white, fontSize: 14, fontWeight: '600' },
  idRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cellBg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  idText: { color: Colors.tarotGold, fontSize: 13, fontWeight: '600', flex: 1 },
  copyBtn: { backgroundColor: Colors.tarotPurple, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  copyBtnText: { color: Colors.white, fontSize: 12 },
  idHint: { color: Colors.textMuted, fontSize: 11, marginTop: 4 },
  restoreRow: { flexDirection: 'row', gap: 8 },
  restoreBtn: {
    backgroundColor: Colors.tarotPurple,
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  restoreBtnDisabled: { opacity: 0.4 },
  restoreBtnText: { color: Colors.white, fontSize: 14, fontWeight: '600' },
});
