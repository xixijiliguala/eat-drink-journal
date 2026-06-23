import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Image,
  TextInput,
  Alert,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';
import { Colors, Shadows } from '../styles/colors';
import * as FileSystem from 'expo-file-system/legacy';
import PressableBounce from './PressableBounce';
import PhotoStickerModal from './PhotoStickerModal';
import { setStickerCache, getStickerCache } from '../utils/stickerCache';
import { loadSavedStickers, deleteSavedSticker, saveAsFavorite, saveStickerWithId, type CustomSticker } from '../utils/stickerStorage';

interface Props {
  visible: boolean;
  dateStr: string | null;
  onClose: () => void;
  onSelect: (dateStr: string, drinkId: string, label?: string) => void;
  onRemoveDrink?: (dateStr: string, entryId: string) => void;
  existingEntryIds?: Array<{ entryId: string; drinkId: string }>;
}

const { width: WINDOW_WIDTH } = Dimensions.get('window');
const COLUMNS = 4;
const ITEM_MARGIN = 8;
const GRID_PAD = 20;
const ITEM_WIDTH = (WINDOW_WIDTH - GRID_PAD * 2 - ITEM_MARGIN * (COLUMNS - 1)) / COLUMNS;

export default function DrinkPicker({
  visible,
  dateStr,
  onClose,
  onSelect,
  onRemoveDrink,
  existingEntryIds = [],
}: Props) {
  const [fotoVisible, setFotoVisible] = useState(false);
  const [savedStickers, setSavedStickers] = useState<CustomSticker[]>([]);
  const sheetAnim = useRef(new Animated.Value(0)).current;

  const refreshSaved = useCallback(async () => {
    const s = await loadSavedStickers();
    setSavedStickers(s);
  }, []);

  useEffect(() => {
    if (visible) {
      refreshSaved();
      Animated.spring(sheetAnim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 4 }).start();
    } else {
      sheetAnim.setValue(0);
    }
  }, [visible, refreshSaved]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, gs) => Math.abs(gs.dy) > 5 && Math.abs(gs.dy) > Math.abs(gs.dx),
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) {
          sheetAnim.setValue(1 - gs.dy / 400);
        }
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 100 || gs.vy > 0.5) {
          onClose();
        } else {
          Animated.spring(sheetAnim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 4 }).start();
        }
      },
    })
  ).current;

  const existingItems = useMemo(() => {
    return existingEntryIds
      .map((e) => {
        if (e.drinkId.startsWith('stkr_')) {
          const b64 = getStickerCache(e.drinkId);
          return { entryId: e.entryId, base64: b64 ?? undefined };
        }
        return null;
      })
      .filter(Boolean) as Array<{ entryId: string; base64?: string }>;
  }, [existingEntryIds]);

  const [pendingRemark, setPendingRemark] = useState('');
  const [pendingSticker, setPendingSticker] = useState<{ dateStr: string; entryId: string } | null>(null);

  const confirmRemark = () => {
    if (pendingSticker && dateStr) {
      onSelect(pendingSticker.dateStr, pendingSticker.entryId, pendingRemark.trim() || undefined);
    }
    setPendingSticker(null);
    setPendingRemark('');
  };

  const handleSelectSaved = async (saved: CustomSticker) => {
    if (dateStr) {
      const b64 = `data:image/png;base64,${await FileSystem.readAsStringAsync(saved.filePath, { encoding: FileSystem.EncodingType.Base64 })}`;
      const entryId = 'stkr_' + Date.now().toString(36);
      setStickerCache(entryId, b64);
      await saveStickerWithId(entryId, b64, saved.label);
      setPendingRemark(saved.label || '');
      setPendingSticker({ dateStr, entryId });
    }
  };

  const handleCustomSticker = useCallback(async (base64: string, label: string) => {
    if (dateStr) {
      const stickerId = 'stkr_' + Date.now().toString(36);
      setStickerCache(stickerId, base64);
      await saveStickerWithId(stickerId, base64, label);
      setPendingRemark(label || '');
      setPendingSticker({ dateStr, entryId: stickerId });
    }
  }, [dateStr]);

  const handleDeleteSaved = useCallback(async (id: string) => {
    await deleteSavedSticker(id);
    refreshSaved();
  }, [refreshSaved]);

  const handleRemove = (entryId: string) => {
    if (dateStr && onRemoveDrink) {
      onRemoveDrink(dateStr, entryId);
    }
  };

  const sheetStyle = {
    transform: [{ translateY: sheetAnim.interpolate({ inputRange: [0, 1], outputRange: [400, 0] }) }],
    opacity: sheetAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <PressableBounce onPress={onClose} style={styles.backdropTouch} />
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>

          <Text style={styles.title}>选择贴纸</Text>

          {existingItems.length > 0 && (
            <View style={styles.existingSection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.existingRow}
              >
                {existingItems.map(({ entryId, base64 }) => (
                  <PressableBounce
                    key={entryId}
                    onPress={() => handleRemove(entryId)}
                    scaleTo={0.85}
                    style={styles.existingSticker}
                  >
                    <View style={styles.existingInner}>
                      {base64 && (
                        <View style={styles.existingCustomWrap}>
                          <Image source={{ uri: base64 }} style={styles.existingCustomImg} />
                        </View>
                      )}
                      <View style={styles.removeBadge}>
                        <Text style={styles.removeBadgeText}>x</Text>
                      </View>
                    </View>
                  </PressableBounce>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.tabRow}>
            <PressableBounce
              onPress={() => setFotoVisible(true)}
              scaleTo={0.92}
              style={styles.tabCamera}
            >
              <Text style={styles.tabCameraText}>📷 拍照制作</Text>
            </PressableBounce>
            <View style={styles.tabDivider} />
            <Text style={styles.sectionTitle}>常用贴纸</Text>
          </View>

          <ScrollView
            style={styles.drinkList}
            contentContainerStyle={styles.drinkListContent}
            showsVerticalScrollIndicator={false}
          >
            {savedStickers.length === 0 && (
              <Text style={styles.empty}>还没有保存的贴纸{'\n'}制作贴纸后可以保存到常用</Text>
            )}
            <View style={styles.grid}>
              {savedStickers.map((saved) => (
                <View key={saved.id} style={{ width: ITEM_WIDTH }}>
                  <PressableBounce
                    onPress={() => handleSelectSaved(saved)}
                    scaleTo={0.92}
                    style={{ alignItems: 'center' }}
                  >
                    <View style={styles.savedStickerWrap}>
                      <Image source={{ uri: saved.filePath }} style={styles.savedStickerImg} />
                    </View>
                    {saved.label ? (
                      <Text style={styles.savedLabel} numberOfLines={1}>{saved.label}</Text>
                    ) : null}
                  </PressableBounce>
                  <PressableBounce
                    onPress={() => handleDeleteSaved(saved.id)}
                    scaleTo={0.8}
                    style={styles.deleteSavedBtn}
                  >
                    <Text style={styles.deleteSavedText}>×</Text>
                  </PressableBounce>
                </View>
              ))}
            </View>
          </ScrollView>

          {pendingSticker && (
            <View style={styles.remarkArea}>
              <Text style={styles.remarkTitle}>添加备注（可选）</Text>
              <TextInput
                style={styles.remarkInput}
                value={pendingRemark}
                onChangeText={setPendingRemark}
                placeholder="这杯配了什么点心..."
                placeholderTextColor={Colors.textMuted}
                returnKeyType="done"
              />
              <View style={styles.remarkBtns}>
                <PressableBounce
                  onPress={() => { setPendingSticker(null); setPendingRemark(''); }}
                  scaleTo={0.92}
                  style={styles.remarkCancel}
                >
                  <Text style={styles.remarkCancelText}>取消</Text>
                </PressableBounce>
                <PressableBounce
                  onPress={confirmRemark}
                  scaleTo={0.92}
                  style={styles.remarkConfirm}
                >
                  <Text style={styles.remarkConfirmText}>确认添加</Text>
                </PressableBounce>
              </View>
            </View>
          )}
        </Animated.View>
      </View>

      <PhotoStickerModal
        visible={fotoVisible}
        onClose={() => setFotoVisible(false)}
        onStickerReady={handleCustomSticker}
          onSaveAsFavorite={async (base64: string, label: string) => {
            try {
              await saveAsFavorite('fav_' + Date.now().toString(36), base64, label);
              await refreshSaved();
            } catch (e: any) {
              Alert.alert('保存失败', e?.message || '');
            }
          }}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdropTouch: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  sheet: {
    backgroundColor: Colors.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 32,
    height: '55%',
    minHeight: 420,
    ...Shadows.card,
  },
  handle: {
    width: 40, height: 5, borderRadius: 3,
    backgroundColor: Colors.textSecondary,
    alignSelf: 'center', marginBottom: 12,
  },
  title: {
    color: Colors.white, fontSize: 16,
    fontWeight: '600', textAlign: 'center', marginBottom: 6,
  },
  existingSection: { marginBottom: 8, paddingHorizontal: 4 },
  existingRow: { flexDirection: 'row', gap: 10 },
  existingSticker: { width: 44, height: 44 },
  existingInner: { position: 'relative' },
  existingCustomWrap: {
    width: 36, height: 36, borderRadius: 8,
    overflow: 'hidden', borderWidth: 1.5, borderColor: Colors.white,
  },
  existingCustomImg: { width: '100%', height: '100%' },
  removeBadge: {
    position: 'absolute', top: -4, right: -4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: Colors.danger,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.white,
  },
  removeBadgeText: { color: Colors.white, fontSize: 11, fontWeight: 'bold', marginTop: -1 },
  tabRow: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 10, paddingHorizontal: 4, gap: 10,
  },
  tabDivider: {
    width: 1, height: 20, backgroundColor: Colors.border,
  },
  sectionTitle: {
    color: Colors.textSecondary, fontSize: 13, fontWeight: '600',
  },
  tabCamera: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16,
    backgroundColor: Colors.tarotCardBack,
    borderWidth: 1, borderColor: Colors.tarotGold,
  },
  tabCameraText: {
    color: Colors.tarotGold, fontSize: 12, fontWeight: '600',
  },
  drinkList: { flex: 1 },
  drinkListContent: { paddingBottom: 8 },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 2,
  },
  savedStickerWrap: {
    width: ITEM_WIDTH - 16, height: ITEM_WIDTH - 16,
    borderRadius: 12, overflow: 'hidden',
    borderWidth: 1.5, borderColor: Colors.white,
    backgroundColor: Colors.white,
    marginBottom: 2,
  },
  savedStickerImg: { width: '100%', height: '100%' },
  savedLabel: {
    color: Colors.textSecondary,
    fontSize: 9,
    marginTop: 3,
    textAlign: 'center',
  },
  deleteSavedBtn: {
    position: 'absolute', top: -2, right: 6,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.danger,
    justifyContent: 'center', alignItems: 'center',
  },
  deleteSavedText: { color: Colors.white, fontSize: 12, fontWeight: 'bold', marginTop: -1 },
  empty: {
    color: Colors.textMuted, textAlign: 'center', marginTop: 20, fontSize: 12, lineHeight: 20,
  },
  remarkArea: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  remarkTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 8,
  },
  remarkInput: {
    backgroundColor: Colors.cellBg,
    color: Colors.white,
    fontSize: 14,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  remarkBtns: {
    flexDirection: 'row',
    gap: 10,
  },
  remarkCancel: {
    flex: 1,
    backgroundColor: Colors.cellBg,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  remarkCancelText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  remarkConfirm: {
    flex: 1,
    backgroundColor: Colors.tarotPurple,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  remarkConfirmText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
