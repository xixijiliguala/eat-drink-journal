import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { Colors, Shadows } from '../styles/colors';
import { getDrinkById } from '../data/drinkLibrary';
import DrinkSticker from './DrinkSticker';
import type { FriendToday } from '../utils/serverApi';

interface Props {
  friend: FriendToday;
}

export default function FriendRow({ friend }: Props) {
  const avatarEmoji = friend.avatar
    || (friend.nickname
      ? String.fromCodePoint((friend.nickname.charCodeAt(0) % 20) + 0x1F600)
      : '\u{1F60A}');

  return (
    <View style={styles.row}>
      <Text style={styles.avatar}>{avatarEmoji}</Text>
      <View style={styles.info}>
        <Text style={styles.name}>{friend.nickname || '\u597D\u53CB'}</Text>
        {friend.entries.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {friend.entries.map((e, i) => {
              const isSticker = e.drinkId.startsWith('stkr_');
              if (isSticker) {
                return (
                  <View key={i} style={styles.stickerWrap}>
                    {e.imageUrl ? (
                      <View style={[styles.stickerBox, Shadows.sticker]}>
                        <Image source={{ uri: e.imageUrl }} style={styles.stickerBoxImg} />
                      </View>
                    ) : (
                      <View style={[styles.stickerBox, styles.stickerBoxFallback]}>
                        <Text style={styles.fallbackEmoji}>{'\u{1F4CC}'}</Text>
                      </View>
                    )}
                    {e.label ? (
                      <Text style={styles.label} numberOfLines={1}>{e.label}</Text>
                    ) : null}
                  </View>
                );
              }
              const drink = getDrinkById(e.drinkId);
              return (
                <View key={i} style={styles.stickerWrap}>
                  {drink ? (
                    <DrinkSticker drink={drink} size={40} />
                  ) : (
                    <View style={[styles.stickerBox, styles.stickerBoxFallback]}>
                      <Text style={styles.fallbackEmoji}>{'\u{2615}'}</Text>
                    </View>
                  )}
                  {e.label ? (
                    <Text style={styles.label} numberOfLines={1}>{e.label}</Text>
                  ) : null}
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <Text style={styles.empty}>{'\u4ECA\u5929\u8FD8\u6CA1\u559D'}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  avatar: { fontSize: 30, marginRight: 12 },
  info: { flex: 1 },
  name: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  stickerWrap: {
    marginRight: 10,
    alignItems: 'center',
  },
  stickerBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
  },
  stickerBoxImg: {
    width: '100%',
    height: '100%',
  },
  stickerBoxFallback: {
    backgroundColor: Colors.cellBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackEmoji: {
    fontSize: 20,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 9,
    marginTop: 2,
    maxWidth: 44,
    textAlign: 'center',
  },
  empty: {
    color: Colors.textMuted,
    fontSize: 12,
  },
});
