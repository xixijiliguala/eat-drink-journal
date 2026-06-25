import React, { useState } from 'react';
import { View, Text, TextInput, Modal, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../styles/colors';
import PressableBounce from './PressableBounce';

const AVATAR_KEY = '@drink_journal_avatar';

const EMOJI_AVATARS = [
  '😀','😎','🤩','🥳','😇','🤠','🦊','🐱','🐶','🐼',
  '🐨','🐸','🦄','🐙','🍉','🍓','🍕','🎸','🌟','🔥',
  '💎','🎀','🌻','🍀','🌙','⚡','🎯','🎲','👑','💀',
];

interface Props {
  visible: boolean;
  onDone: (nickname: string, avatar: string) => void;
}

export default function NicknamePrompt({ visible, onDone }: Props) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');

  const handleDone = async () => {
    const trimmed = name.trim();
    if (trimmed.length > 0) {
      if (avatar) await AsyncStorage.setItem(AVATAR_KEY, avatar);
      onDone(trimmed, avatar);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>欢迎使用饮品打卡！</Text>
          <Text style={styles.subtitle}>选择头像和昵称，好友就能认出你</Text>

          <Text style={styles.label}>选择头像</Text>
          <View style={styles.emojiGrid}>
            {EMOJI_AVATARS.map((e) => (
              <PressableBounce key={e} onPress={() => setAvatar(e)} scaleTo={0.85}>
                <View style={[styles.emojiItem, avatar === e && styles.emojiSelected]}>
                  <Text style={styles.emoji}>{e}</Text>
                </View>
              </PressableBounce>
            ))}
          </View>

          <Text style={styles.label}>昵称</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="输入昵称"
            placeholderTextColor={Colors.textMuted}
            maxLength={10}
            autoFocus
          />
          <PressableBounce
            onPress={handleDone}
            scaleTo={0.92}
            style={[styles.btn, name.trim().length === 0 && styles.btnDisabled]}
            disabled={name.trim().length === 0}
          >
            <Text style={styles.btnText}>完成</Text>
          </PressableBounce>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  title: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    marginBottom: 16,
  },
  emojiItem: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.cellBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiSelected: {
    backgroundColor: Colors.tarotPurple,
  },
  emoji: {
    fontSize: 24,
  },
  input: {
    color: Colors.white,
    fontSize: 16,
    backgroundColor: Colors.cellBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
    textAlign: 'center',
    marginBottom: 20,
  },
  btn: {
    backgroundColor: Colors.tarotPurple,
    borderRadius: 14,
    paddingHorizontal: 40,
    paddingVertical: 12,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
