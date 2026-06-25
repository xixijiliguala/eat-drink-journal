import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
  Dimensions,
  NativeModules,
  Platform,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Image as ImageIcon, X, Star } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Shadows } from '../styles/colors';
import { FontFamily, FontSize, FontWeight, Radius, Spacing } from '../styles/tokens';
import PressableBounce from './PressableBounce';
import { WashiTape } from './stickers/PolaroidSticker';
import { saveSticker } from '../utils/stickerStorage';

interface Props {
  visible: boolean;
  onClose: () => void;
  onStickerReady: (
    base64: string,
    label: string,
    scale: number,
    offsetX: number,
    offsetY: number
  ) => void;
  onSaveAsFavorite?: (base64: string, label: string) => void;
}

type Step = 'pick' | 'select' | 'processing' | 'result';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const MobileSAM = NativeModules.MobileSAMModule;

const PREVIEW_SIZE = 340;
const PREVIEW_BORDER = 4;
const PREVIEW_INNER = PREVIEW_SIZE - PREVIEW_BORDER * 2;
const SCALE_MIN = 0.3;
const SCALE_MAX = 2.2;

export default function PhotoStickerModal({
  visible,
  onClose,
  onStickerReady,
  onSaveAsFavorite,
}: Props) {
  const [step, setStep] = useState<Step>('pick');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [savedAsFav, setSavedAsFav] = useState(false);
  const [scalePct, setScalePct] = useState(100);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const viewLayout = useRef({ width: 0, height: 0 });
  const imageDisplayRect = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const baseDistanceRef = useRef(0);
  const baseScaleRef = useRef(1);
  const dragStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const scaleRef = useRef(1);
  const offsetXRef = useRef(0);
  const offsetYRef = useRef(0);

  const reset = useCallback(() => {
    setStep('pick');
    setImageUri(null);
    setResult(null);
    setLabel('');
    setSavedAsFav(false);
    setScalePct(100);
    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
    scaleRef.current = 1;
    offsetXRef.current = 0;
    offsetYRef.current = 0;
    baseDistanceRef.current = 0;
    baseScaleRef.current = 1;
    dragStartRef.current = null;
    viewLayout.current = { width: 0, height: 0 };
    imageDisplayRect.current = { x: 0, y: 0, w: 0, h: 0 };
    onClose();
  }, [onClose]);

  const openPicker = useCallback(async (mode: 'camera' | 'album') => {
    if (mode === 'album' && Platform.OS === 'android' && MobileSAM?.pickImage) {
      try {
        const uri = await MobileSAM.pickImage();
        setImageUri(uri);
        setStep('select');
        return;
      } catch (err: any) {
        if (err?.message !== 'CANCELLED' && err?.code !== 'CANCELLED') {
          Alert.alert('错误', err?.message || '');
        }
        return;
      }
    }

    try {
      if (mode === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('需要相机权限');
          return;
        }
        const r = await ImagePicker.launchCameraAsync({ quality: 0.8, base64: false });
        if (!r.canceled && r.assets[0]) {
          setImageUri(r.assets[0].uri);
          setStep('select');
        }
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('需要相册权限');
          return;
        }
        const r = await ImagePicker.launchImageLibraryAsync({
          quality: 0.8,
          base64: false,
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
        });
        if (!r.canceled && r.assets[0]) {
          setImageUri(r.assets[0].uri);
          setStep('select');
        }
      }
    } catch (err: any) {
      Alert.alert('错误', err?.message || '');
    }
  }, []);

  const handleViewLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout;
      viewLayout.current = { width, height };
      if (!imageUri) return;
      Image.getSize(
        imageUri,
        (iw, ih) => {
          const vw = width;
          const vh = height;
          const s = Math.min(vw / iw, vh / ih);
          const dw = iw * s;
          const dh = ih * s;
          imageDisplayRect.current = {
            x: (vw - dw) / 2,
            y: (vh - dh) / 2,
            w: dw,
            h: dh,
          };
        },
        () => {}
      );
    },
    [imageUri]
  );

  const handleImageTap = useCallback(
    (e: any) => {
      const clickX = e.nativeEvent.locationX;
      const clickY = e.nativeEvent.locationY;
      setStep('processing');
      const vw = viewLayout.current.width;
      const vh = viewLayout.current.height;
      if (Platform.OS === 'android' && MobileSAM && vw > 0 && vh > 0) {
        MobileSAM.segment(imageUri!, clickX, clickY, vw, vh)
          .then((base64: string) => {
            setResult(`data:image/png;base64,${base64}`);
            setStep('result');
            saveSticker(`data:image/png;base64,${base64}`).catch(() => {});
          })
          .catch((err: any) => {
            setStep('select');
            Alert.alert('抠图失败', err?.message || '请重试');
          });
      } else {
        setStep('select');
        Alert.alert('提示', '此功能目前仅支持 Android');
      }
    },
    [imageUri]
  );

  const handleUse = useCallback(async () => {
    if (!result) return;
    try {
      const ratioX = offsetX / PREVIEW_INNER;
      const ratioY = offsetY / PREVIEW_INNER;
      await onStickerReady(result, label.trim(), scale, ratioX, ratioY);
    } catch (err: any) {
      Alert.alert('添加失败', err?.message || '请重试');
      return;
    }
    reset();
  }, [result, label, scale, offsetX, offsetY, onStickerReady, reset]);

  const handlePreviewTouchStart = useCallback((e: GestureResponderEvent) => {
    const touches = e.nativeEvent.touches;
    if (touches.length === 1) {
      dragStartRef.current = {
        x: touches[0].pageX,
        y: touches[0].pageY,
        offsetX: offsetXRef.current,
        offsetY: offsetYRef.current,
      };
    } else if (touches.length >= 2) {
      const dx = touches[0].pageX - touches[1].pageX;
      const dy = touches[0].pageY - touches[1].pageY;
      baseDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
      baseScaleRef.current = scaleRef.current;
      dragStartRef.current = null;
    }
  }, []);

  const handlePreviewTouchMove = useCallback((e: GestureResponderEvent) => {
    const touches = e.nativeEvent.touches;
    if (touches.length >= 2 && baseDistanceRef.current > 0) {
      const dx = touches[0].pageX - touches[1].pageX;
      const dy = touches[0].pageY - touches[1].pageY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ratio = dist / baseDistanceRef.current;
      const next = baseScaleRef.current * ratio;
      const clamped = Math.max(SCALE_MIN, Math.min(SCALE_MAX, next));
      scaleRef.current = clamped;
      setScale(clamped);
      setScalePct(Math.round(clamped * 100));
    } else if (touches.length === 1 && dragStartRef.current) {
      const t = touches[0];
      const start = dragStartRef.current;
      const newOffsetX = start.offsetX + (t.pageX - start.x);
      const newOffsetY = start.offsetY + (t.pageY - start.y);
      offsetXRef.current = newOffsetX;
      offsetYRef.current = newOffsetY;
      setOffsetX(newOffsetX);
      setOffsetY(newOffsetY);
    }
  }, []);

  const handlePreviewTouchEnd = useCallback(() => {
    baseDistanceRef.current = 0;
    dragStartRef.current = null;
  }, []);

  const handleRecenter = useCallback(() => {
    offsetXRef.current = 0;
    offsetYRef.current = 0;
    setOffsetX(0);
    setOffsetY(0);
  }, []);

  const handleSaveFav = useCallback(async () => {
    if (!result || !onSaveAsFavorite) return;
    try {
      await onSaveAsFavorite(result, label.trim());
      setSavedAsFav(true);
    } catch (err: any) {
      Alert.alert('保存失败', err?.message || '');
    }
  }, [result, label, onSaveAsFavorite]);

  if (step === 'pick') {
    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={reset}>
        <View style={styles.backdrop}>
          <PressableBounce onPress={reset} style={{ flex: 1 }} />
        </View>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.pickArea}>
            <Text style={styles.title}>制作贴纸</Text>
            <Text style={styles.hint}>拍照或选照片，点一下饮品自动抠图</Text>
            <View style={styles.btnRow}>
              <PressableBounce
                onPress={() => openPicker('camera')}
                haptic="light"
                style={styles.actionBtn}
              >
                <Camera size={16} color={Colors.tarotGold} strokeWidth={2.2} />
                <Text style={styles.actionBtnText}>拍照</Text>
              </PressableBounce>
              <PressableBounce
                onPress={() => openPicker('album')}
                haptic="light"
                style={styles.actionBtn}
              >
                <ImageIcon size={16} color={Colors.tarotGold} strokeWidth={2.2} />
                <Text style={styles.actionBtnText}>相册</Text>
              </PressableBounce>
            </View>
            <PressableBounce onPress={reset} haptic="light" style={styles.cancelBtn}>
              <Text style={styles.cancelText}>取消</Text>
            </PressableBounce>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={reset}>
      <View style={styles.fullScreen}>
        <LinearGradient
          colors={[Colors.bgDeep, Colors.bgDark]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.topBar}>
          <PressableBounce onPress={reset} haptic="light" style={styles.closeBtn}>
            <X size={18} color={Colors.textPrimary} strokeWidth={2.2} />
          </PressableBounce>
          <Text style={styles.topTitle}>
            {step === 'select'
              ? '点击饮品主体'
              : step === 'processing'
                ? '处理中...'
                : '贴纸预览'}
          </Text>
          <View style={styles.closeBtn} />
        </View>

        <View style={styles.imageArea}>
          <View style={styles.imageOuter} onLayout={handleViewLayout}>
            {imageUri ? (
              <TouchableWithoutFeedback
                onPress={handleImageTap}
                disabled={step !== 'select'}
              >
                <View style={styles.imageTouchable}>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.imageFit}
                    resizeMode="contain"
                  />
                  {step === 'select' ? (
                    <View style={styles.tapHint}>
                      <Text style={styles.tapHintText}>👆 点击你想抠出的饮品</Text>
                    </View>
                  ) : null}
                </View>
              </TouchableWithoutFeedback>
            ) : null}
          </View>
        </View>

        {step === 'processing' ? (
          <View style={styles.processingBar}>
            <ActivityIndicator size="large" color={Colors.tarotGold} />
            <Text style={styles.processingText}>MobileSAM 分割中...</Text>
          </View>
        ) : null}

        {step === 'result' && result ? (
          <View style={styles.resultBar}>
            <View style={styles.resultPreview}>
              <View style={styles.previewTapeRow} pointerEvents="none">
                <WashiTape width={PREVIEW_SIZE * 0.45} height={14} tilt={4} top={-6} />
              </View>
              <View
                style={styles.previewImageArea}
                onTouchStart={handlePreviewTouchStart}
                onTouchMove={handlePreviewTouchMove}
                onTouchEnd={handlePreviewTouchEnd}
                onTouchCancel={handlePreviewTouchEnd}
              >
                <Image
                  source={{ uri: result }}
                  style={{
                    width: PREVIEW_INNER,
                    height: PREVIEW_INNER,
                    transform: [
                      { translateX: offsetX },
                      { translateY: offsetY },
                      { scale },
                    ],
                  }}
                  resizeMode="contain"
                />
              </View>
            </View>
            <View style={styles.scaleRow}>
              <Text style={styles.scaleLabel}>{scalePct}%</Text>
              <PressableBounce onPress={handleRecenter} haptic="light" style={styles.recenterBtn}>
                <Text style={styles.recenterText}>居中</Text>
              </PressableBounce>
              <Text style={styles.scaleHint}>· 单指拖动 · 双指缩放</Text>
            </View>
            <TextInput
              style={styles.labelInput}
              value={label}
              onChangeText={setLabel}
              placeholder="给贴纸起个名字"
              placeholderTextColor={Colors.textMuted}
              maxLength={8}
              returnKeyType="done"
            />
            <View style={styles.resultBtns}>
              <PressableBounce onPress={handleUse} haptic="medium" style={styles.useBtn}>
                <Text style={styles.useBtnText}>使用贴纸</Text>
              </PressableBounce>
              {onSaveAsFavorite && !savedAsFav ? (
                <PressableBounce onPress={handleSaveFav} haptic="light" style={styles.favBtn}>
                  <Star size={12} color={Colors.tarotGold} strokeWidth={2.4} fill={Colors.tarotGold} />
                  <Text style={styles.favBtnText}>收藏</Text>
                </PressableBounce>
              ) : null}
              {savedAsFav ? (
                <View style={styles.favDone}>
                  <Text style={styles.favDoneText}>已收藏</Text>
                </View>
              ) : null}
              <PressableBounce onPress={reset} haptic="light" style={styles.retryBtn}>
                <Text style={styles.retryText}>重选</Text>
              </PressableBounce>
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.scrim,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.cardBg,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    paddingTop: Spacing.md,
    minHeight: 320,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: Colors.borderSoft,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  pickArea: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    fontFamily: FontFamily.display,
    marginBottom: 6,
  },
  hint: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    fontFamily: FontFamily.body,
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    backgroundColor: Colors.cellBg,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  actionBtnText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    fontFamily: FontFamily.bodyMedium,
  },
  cancelBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: 10,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
  },
  cancelText: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
    fontFamily: FontFamily.bodyMedium,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: Colors.bgDark,
    paddingTop: 44,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  topTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    fontFamily: FontFamily.bodySemiBold,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  imageArea: { flex: 1, padding: Spacing.lg },
  imageOuter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  imageTouchable: { flex: 1, alignSelf: 'stretch' },
  imageFit: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: Radius.md,
    backgroundColor: Colors.cellBg,
  },
  tapHint: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  tapHintText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.bodyMedium,
  },
  processingBar: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  processingText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    marginTop: Spacing.md,
    fontFamily: FontFamily.body,
  },
  resultBar: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  resultPreview: {
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
    borderRadius: Radius.lg,
    backgroundColor: Colors.paper,
    alignSelf: 'center',
    marginBottom: Spacing.xs,
    overflow: 'hidden',
    ...Shadows.polaroid,
  },
  previewTapeRow: {
    height: 26,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  previewImageArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  scaleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  scaleLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontFamily: FontFamily.bodyMedium,
    letterSpacing: 0.3,
  },
  recenterBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: Colors.cellBg,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  recenterText: {
    color: Colors.textPrimary,
    fontSize: FontSize.xs,
    fontFamily: FontFamily.bodyMedium,
  },
  scaleHint: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontFamily: FontFamily.body,
  },
  labelInput: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontFamily: FontFamily.body,
    textAlign: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.cellBg,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  resultBtns: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  useBtn: {
    flex: 2,
    backgroundColor: Colors.tarotPurple,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.tarotGold,
  },
  useBtnText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    fontFamily: FontFamily.bodySemiBold,
  },
  favBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.cellBg,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.tarotGold,
  },
  favBtnText: {
    color: Colors.tarotGold,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    fontFamily: FontFamily.bodySemiBold,
  },
  favDone: {
    flex: 1,
    backgroundColor: 'rgba(212, 168, 83, 0.15)',
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.tarotGold,
  },
  favDoneText: {
    color: Colors.tarotGold,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    fontFamily: FontFamily.bodySemiBold,
  },
  retryBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  retryText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.bodyMedium,
  },
});