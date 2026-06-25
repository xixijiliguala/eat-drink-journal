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
  Pressable,
} from 'react-native';
import { Camera } from 'lucide-react-native';
import { Colors, Shadows } from '../styles/colors';
import { FontFamily, FontSize, FontWeight, Motion, Radius, Spacing } from '../styles/tokens';
import * as FileSystem from 'expo-file-system/legacy';
import PressableBounce from './PressableBounce';
import PhotoStickerModal from './PhotoStickerModal';
import { setStickerCache, getStickerCache } from '../utils/stickerCache';
import { loadSavedStickers, deleteSavedSticker, saveAsFavorite, saveStickerWithId, type CustomSticker } from '../utils/stickerStorage';

interface Props {
  visible: boolean;
  dateStr: string | null;
  onClose: () => void;
  onSelect: (
    dateStr: string,
    drinkId: string,
    label?: string,
    scale?: number,
    offsetX?: number,
    offsetY?: number
  ) => void;
  onRemoveDrink?: (dateStr: string, entryId: string) => void;
  existingEntryIds?: Array<{ entryId: string; drinkId: string }>;
}

const { width: WINDOW_WIDTH } = Dimensions.get('window');
const STICKER_COLUMNS = 5;
const STICKER_GAP = 8;
const STICKER_PAD_H = 16;
const STICKER_WIDTH =
  (WINDOW_WIDTH - STICKER_PAD_H * 2 - STICKER_GAP * (STICKER_COLUMNS - 1)) / STICKER_COLUMNS;

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
  const sheetY = useRef(new Animated.Value(0)).current;
  const sheetOpacity = useRef(new Animated.Value(0)).current;
  const dragDy = useRef(0);

  const refreshSaved = useCallback(async () => {
    const s = await loadSavedStickers();
    setSavedStickers(s);
  }, []);

  useEffect(() => {
    if (visible) {
      refreshSaved();
      dragDy.current = 0;
      Animated.parallel([
        Animated.spring(sheetY, {
          toValue: 1,
          useNativeDriver: true,
          speed: 14,
          bounciness: 6,
        }),
        Animated.timing(sheetOpacity, {
          toValue: 1,
          duration: Motion.timingBase,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      sheetY.setValue(0);
      sheetOpacity.setValue(0);
    }
  }, [visible, refreshSaved]);

  const handleClose = useCallback(() => onClose(), [onClose]);

  const existingItems = useMemo(() => {
    return existingEntryIds
      .map((e) => {
        if (e.drinkId.startsWith('stkr_') || e.drinkId.startsWith('fav_')) {
          const b64 = getStickerCache(e.drinkId);
          return { entryId: e.entryId, base64: b64 ?? undefined };
        }
        return null;
      })
      .filter(Boolean) as Array<{ entryId: string; base64?: string }>;
  }, [existingEntryIds]);

  const [pendingRemark, setPendingRemark] = useState('');
  const [pendingSticker, setPendingSticker] = useState<
    { dateStr: string; entryId: string; scale: number; offsetX: number; offsetY: number } | null
  >(null);

  const confirmRemark = useCallback(() => {
    if (pendingSticker && dateStr) {
      onSelect(
        pendingSticker.dateStr,
        pendingSticker.entryId,
        pendingRemark.trim() || undefined,
        pendingSticker.scale,
        pendingSticker.offsetX,
        pendingSticker.offsetY
      );
    }
    setPendingSticker(null);
    setPendingRemark('');
  }, [pendingSticker, dateStr, pendingRemark, onSelect]);

  const handleSelectSaved = useCallback(
    async (saved: CustomSticker) => {
      if (!dateStr) return;
      const b64 = `data:image/png;base64,${await FileSystem.readAsStringAsync(saved.filePath, {
        encoding: FileSystem.EncodingType.Base64,
      })}`;
      const entryId = 'stkr_' + Date.now().toString(36);
      setStickerCache(entryId, b64);
      await saveStickerWithId(entryId, b64, saved.label);
      setPendingRemark(saved.label || '');
      setPendingSticker({ dateStr, entryId, scale: 1, offsetX: 0, offsetY: 0 });
    },
    [dateStr]
  );

  const handleCustomSticker = useCallback(
    async (base64: string, label: string, scale: number, offsetX: number, offsetY: number) => {
      if (!dateStr) return;
      const stickerId = 'stkr_' + Date.now().toString(36);
      setStickerCache(stickerId, base64);
      await saveStickerWithId(stickerId, base64, label);
      setPendingRemark(label || '');
      setPendingSticker({ dateStr, entryId: stickerId, scale, offsetX, offsetY });
    },
    [dateStr]
  );

  const handleDeleteSaved = useCallback(
    async (id: string) => {
      await deleteSavedSticker(id);
      refreshSaved();
    },
    [refreshSaved]
  );

  const handleRemove = useCallback(
    (entryId: string) => {
      if (dateStr && onRemoveDrink) onRemoveDrink(dateStr, entryId);
    },
    [dateStr, onRemoveDrink]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gs) =>
          Math.abs(gs.dy) > 8 && Math.abs(gs.dy) > Math.abs(gs.dx),
        onPanResponderMove: (_, gs) => {
          if (gs.dy > 0) {
            dragDy.current = gs.dy;
            sheetY.setValue(Math.max(0, 1 - gs.dy / 400));
            sheetOpacity.setValue(Math.max(0.4, 1 - gs.dy / 600));
          }
        },
        onPanResponderRelease: (_, gs) => {
          if (dragDy.current > 100 || (gs.dy > 40 && gs.vy > 0.6)) {
            handleClose();
          } else {
            Animated.parallel([
              Animated.spring(sheetY, {
                toValue: 1,
                useNativeDriver: true,
                speed: 20,
                bounciness: 4,
              }),
              Animated.timing(sheetOpacity, {
                toValue: 1,
                duration: Motion.timingBase,
                useNativeDriver: true,
              }),
            ]).start();
          }
          dragDy.current = 0;
        },
      }),
    [handleClose, sheetY, sheetOpacity]
  );

  const sheetTranslate = sheetY.interpolate({
    inputRange: [0, 1],
    outputRange: [WINDOW_WIDTH, 0],
  });

  const hasExisting = existingItems.length > 0;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, { opacity: sheetOpacity }]} />
        <PressableBounce onPress={handleClose} style={styles.backdropTouch} />
        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: sheetTranslate }] },
          ]}
        >
          <View {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>

          <View style={styles.header}>
            <View style={styles.headerSide} />
            <Text style={styles.title}>添加贴纸</Text>
            <View style={styles.headerSide}>
              <PressableBounce
                onPress={() => setFotoVisible(true)}
                haptic="light"
                style={styles.cameraFab}
              >
                <Camera size={16} color={Colors.textPrimary} strokeWidth={2.2} />
              </PressableBounce>
            </View>
          </View>

          <View style={styles.content}>
            {hasExisting ? (
              <View style={styles.section}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.existingRow}
                >
                  {existingItems.map(({ entryId, base64 }) => (
                    <View key={entryId} style={styles.existingSticker}>
                      <View style={styles.existingInner}>
                        {base64 ? (
                          <Image source={{ uri: base64 }} style={styles.existingCustomImg} />
                        ) : null}
                      </View>
                      <Pressable
                        onPress={() => handleRemove(entryId)}
                        style={styles.removeBtn}
                        hitSlop={6}
                      >
                        <Text style={styles.removeBtnText}>x</Text>
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            <View style={styles.section}>
              {savedStickers.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>🍵</Text>
                  <Text style={styles.emptyText}>还没有常用贴纸</Text>
                  <Text style={styles.emptyHint}>
                    拍照后选择「收藏」即可保存到这里
                  </Text>
                </View>
              ) : (
                <ScrollView
                  contentContainerStyle={styles.grid}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.grid}>
                    {savedStickers.map((saved) => (
                      <View key={saved.id} style={styles.gridItem}>
                        <PressableBounce
                          onPress={() => handleSelectSaved(saved)}
                          haptic="light"
                          style={styles.gridBtn}
                        >
                          <View style={styles.stickerFrame}>
                            <Image source={{ uri: saved.filePath }} style={styles.stickerImg} />
                          </View>
                          {saved.label ? (
                            <Text style={styles.stickerLabel} numberOfLines={1}>
                              {saved.label}
                            </Text>
                          ) : (
                            <Text style={styles.stickerLabelHint}>未命名</Text>
                          )}
                        </PressableBounce>
                        <PressableBounce
                          onPress={() => handleDeleteSaved(saved.id)}
                          haptic="light"
                          style={styles.deleteBtn}
                        >
                          <Text style={styles.deleteBtnText}>x</Text>
                        </PressableBounce>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              )}
            </View>
          </View>

          {pendingSticker ? (
            <View style={styles.remarkArea}>
              <View style={styles.remarkHeader}>
                <Text style={styles.remarkTitle}>备注</Text>
              </View>
              <TextInput
                style={styles.remarkInput}
                value={pendingRemark}
                onChangeText={setPendingRemark}
                placeholder="给这张贴纸加个备注..."
                placeholderTextColor={Colors.textMuted}
                returnKeyType="done"
                maxLength={20}
                autoFocus
              />
              <View style={styles.remarkBtns}>
                <PressableBounce
                  onPress={() => {
                    setPendingSticker(null);
                    setPendingRemark('');
                  }}
                  haptic="light"
                  style={styles.remarkCancel}
                >
                  <Text style={styles.remarkCancelText}>取消</Text>
                </PressableBounce>
                <PressableBounce
                  onPress={confirmRemark}
                  haptic="medium"
                  style={styles.remarkConfirm}
                >
                  <Text style={styles.remarkConfirmText}>添加</Text>
                </PressableBounce>
              </View>
            </View>
          ) : null}
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
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.scrim,
  },
  backdropTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheet: {
    backgroundColor: Colors.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: STICKER_PAD_H,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
    height: '52%',
    minHeight: 380,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderSoft,
    ...Shadows.modal,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerSide: {
    width: 36,
    alignItems: 'center',
  },
  title: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontFamily: FontFamily.bodySemiBold,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
  cameraFab: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bgDeep,
    borderWidth: 1,
    borderColor: Colors.tarotGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.md,
  },
  existingRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  existingSticker: {
    width: 44,
    height: 44,
    position: 'relative',
  },
  existingInner: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  existingCustomImg: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.white,
    zIndex: 5,
  },
  removeBtnText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: -1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: STICKER_GAP,
    paddingBottom: Spacing.md,
  },
  gridItem: {
    width: STICKER_WIDTH,
    position: 'relative',
  },
  gridBtn: {
    alignItems: 'center',
  },
  stickerFrame: {
    width: STICKER_WIDTH,
    height: STICKER_WIDTH,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.paper,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderPaper,
  },
  stickerImg: {
    width: '100%',
    height: '100%',
  },
  stickerLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: FontFamily.body,
    marginTop: 4,
    textAlign: 'center',
  },
  stickerLabelHint: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: FontFamily.body,
    marginTop: 4,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.6,
  },
  deleteBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(45, 36, 32, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: -1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
    opacity: 0.5,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.bodyMedium,
    marginBottom: 2,
  },
  emptyHint: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: FontFamily.body,
    textAlign: 'center',
  },
  remarkArea: {
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.borderSoft,
  },
  remarkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  remarkTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: FontFamily.bodySemiBold,
    fontWeight: FontWeight.semibold,
  },
  remarkInput: {
    backgroundColor: Colors.surface,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontFamily: FontFamily.body,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
    marginBottom: Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderSoft,
  },
  remarkBtns: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  remarkCancel: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  remarkCancelText: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
    fontFamily: FontFamily.bodyMedium,
  },
  remarkConfirm: {
    flex: 1,
    backgroundColor: Colors.textPrimary,
    borderRadius: Radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  remarkConfirmText: {
    color: Colors.bg,
    fontSize: FontSize.md,
    fontFamily: FontFamily.bodySemiBold,
    fontWeight: FontWeight.semibold,
  },
});