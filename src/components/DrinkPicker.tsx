import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Camera, X, Trash2, StickyNote as StickyNoteIcon } from 'lucide-react-native';
import { Colors, Shadows } from '../styles/colors';
import { FontSize, FontWeight, Motion, Radius, Spacing } from '../styles/tokens';
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
const ITEM_MARGIN = 10;
const GRID_PAD = 20;
const ITEM_WIDTH = (WINDOW_WIDTH - GRID_PAD * 2 - ITEM_MARGIN * (COLUMNS - 1)) / COLUMNS;

const AnimatedView = Animated.View;

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
  const sheetY = useSharedValue(800);
  const backdropOpacity = useSharedValue(0);

  const refreshSaved = useCallback(async () => {
    const s = await loadSavedStickers();
    setSavedStickers(s);
  }, []);

  useEffect(() => {
    if (visible) {
      refreshSaved();
      sheetY.value = withSpring(0, Motion.springBounce);
      backdropOpacity.value = withTiming(1, { duration: Motion.timingBase });
    } else {
      sheetY.value = 800;
      backdropOpacity.value = 0;
    }
  }, [visible, refreshSaved, sheetY, backdropOpacity]);

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
  const [pendingSticker, setPendingSticker] = useState<{ dateStr: string; entryId: string } | null>(null);

  const confirmRemark = useCallback(() => {
    if (pendingSticker && dateStr) {
      onSelect(pendingSticker.dateStr, pendingSticker.entryId, pendingRemark.trim() || undefined);
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
      setPendingSticker({ dateStr, entryId });
    },
    [dateStr]
  );

  const handleCustomSticker = useCallback(
    async (base64: string, label: string) => {
      if (!dateStr) return;
      const stickerId = 'stkr_' + Date.now().toString(36);
      setStickerCache(stickerId, base64);
      await saveStickerWithId(stickerId, base64, label);
      setPendingRemark(label || '');
      setPendingSticker({ dateStr, entryId: stickerId });
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
      if (dateStr && onRemoveDrink) {
        onRemoveDrink(dateStr, entryId);
      }
    },
    [dateStr, onRemoveDrink]
  );

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <AnimatedView style={[styles.backdrop, backdropStyle]} />
        <PressableBounce onPress={onClose} style={styles.backdropTouch} haptic="light" />
        <AnimatedView style={[styles.sheet, sheetStyle]}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <Text style={styles.title}>选择贴纸</Text>
            <PressableBounce onPress={onClose} haptic="light" style={styles.iconBtn}>
              <X size={18} color={Colors.textMuted} strokeWidth={2.2} />
            </PressableBounce>
          </View>

          {existingItems.length > 0 && (
            <View style={styles.existingSection}>
              <Text style={styles.sectionTitle}>已添加</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.existingRow}
              >
                {existingItems.map(({ entryId, base64 }) => (
                  <PressableBounce
                    key={entryId}
                    onPress={() => handleRemove(entryId)}
                    haptic="medium"
                    style={styles.existingSticker}
                  >
                    <View style={styles.existingInner}>
                      {base64 ? (
                        <Image source={{ uri: base64 }} style={styles.existingCustomImg} />
                      ) : null}
                      <View style={styles.removeBadge}>
                        <Trash2 size={10} color={Colors.white} strokeWidth={2.4} />
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
              haptic="light"
              style={styles.tabCamera}
            >
              <Camera size={14} color={Colors.tarotGold} strokeWidth={2.2} />
              <Text style={styles.tabCameraText}>拍照制作</Text>
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
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>🧋</Text>
                <Text style={styles.emptyText}>
                  还没有保存的贴纸{'\n'}拍照制作后可保存到常用
                </Text>
              </View>
            )}
            <View style={styles.grid}>
              {savedStickers.map((saved) => (
                <View key={saved.id} style={{ width: ITEM_WIDTH }}>
                  <PressableBounce
                    onPress={() => handleSelectSaved(saved)}
                    haptic="light"
                    style={{ alignItems: 'center' }}
                  >
                    <LinearGradient
                      colors={['#fff', '#f5edd6']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={styles.savedStickerWrap}
                    >
                      <Image source={{ uri: saved.filePath }} style={styles.savedStickerImg} />
                    </LinearGradient>
                    {saved.label ? (
                      <Text style={styles.savedLabel} numberOfLines={1}>
                        {saved.label}
                      </Text>
                    ) : null}
                  </PressableBounce>
                  <PressableBounce
                    onPress={() => handleDeleteSaved(saved.id)}
                    haptic="light"
                    style={styles.deleteSavedBtn}
                  >
                    <X size={12} color={Colors.white} strokeWidth={2.4} />
                  </PressableBounce>
                </View>
              ))}
            </View>
          </ScrollView>

          {pendingSticker ? (
            <View style={styles.remarkArea}>
              <View style={styles.remarkHeader}>
                <StickyNoteIcon size={14} color={Colors.tarotGold} strokeWidth={2.2} />
                <Text style={styles.remarkTitle}>添加备注（可选）</Text>
              </View>
              <TextInput
                style={styles.remarkInput}
                value={pendingRemark}
                onChangeText={setPendingRemark}
                placeholder="这杯配了什么点心..."
                placeholderTextColor={Colors.textMuted}
                returnKeyType="done"
                maxLength={20}
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
                <PressableBounce onPress={confirmRemark} haptic="medium" style={styles.remarkConfirm}>
                  <Text style={styles.remarkConfirmText}>确认添加</Text>
                </PressableBounce>
              </View>
            </View>
          ) : null}
        </AnimatedView>
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
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    height: '62%',
    minHeight: 440,
    borderTopWidth: 1,
    borderColor: Colors.borderSoft,
    ...Shadows.modal,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    fontFamily: 'Caveat',
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  existingSection: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.4,
    marginBottom: Spacing.sm,
  },
  existingRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  existingSticker: {
    width: 50,
    height: 50,
  },
  existingInner: {
    position: 'relative',
    width: 50,
    height: 50,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.paper,
  },
  existingCustomImg: {
    width: '100%',
    height: '100%',
  },
  removeBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  tabDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
  },
  tabCamera: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: Colors.tarotCardBack,
    borderWidth: 1,
    borderColor: Colors.tarotGold,
  },
  tabCameraText: {
    color: Colors.tarotGold,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  drinkList: { flex: 1 },
  drinkListContent: { paddingBottom: Spacing.md },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 2,
    gap: Spacing.md,
  },
  savedStickerWrap: {
    width: ITEM_WIDTH - 16,
    height: ITEM_WIDTH - 16,
    borderRadius: Radius.md,
    overflow: 'hidden',
    padding: 4,
  },
  savedStickerImg: { width: '100%', height: '100%', borderRadius: Radius.sm },
  savedLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 4,
    textAlign: 'center',
  },
  deleteSavedBtn: {
    position: 'absolute',
    top: -2,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: Spacing.sm,
    opacity: 0.5,
  },
  emptyText: {
    color: Colors.textMuted,
    textAlign: 'center',
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  remarkArea: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.borderSoft,
  },
  remarkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  remarkTitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  remarkInput: {
    backgroundColor: Colors.cellBg,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    marginBottom: Spacing.md,
  },
  remarkBtns: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  remarkCancel: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  remarkCancelText: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
  },
  remarkConfirm: {
    flex: 1,
    backgroundColor: Colors.tarotPurple,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  remarkConfirmText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
});
