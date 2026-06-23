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
  type LayoutChangeEvent,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../styles/colors';
import PressableBounce from './PressableBounce';
import { saveSticker } from '../utils/stickerStorage';

interface Props {
  visible: boolean;
  onClose: () => void;
  onStickerReady: (base64: string, label: string) => void;
  onSaveAsFavorite?: (base64: string, label: string) => void;
}

type Step = 'pick' | 'select' | 'processing' | 'result';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const MobileSAM = NativeModules.MobileSAMModule;

export default function PhotoStickerModal({ visible, onClose, onStickerReady, onSaveAsFavorite }: Props) {
  const [step, setStep] = useState<Step>('pick');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const viewLayout = useRef({ width: 0, height: 0 });
  const imageDisplayRect = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const [savedAsFav, setSavedAsFav] = useState(false);

  const reset = useCallback(() => {
    setStep('pick');
    setImageUri(null);
    setResult(null);
    setLabel('');
    setSavedAsFav(false);
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

    if (mode === 'camera') {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) { Alert.alert('需要相机权限'); return; }
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { Alert.alert('需要相册权限'); return; }
    }

    try {
      const r = mode === 'camera'
        ? await ImagePicker.launchCameraAsync({ quality: 0.8, base64: false })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.8, base64: false, mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false });

      if (!r.canceled && r.assets[0]) {
        setImageUri(r.assets[0].uri);
        setStep('select');
      }
    } catch (err: any) {
      Alert.alert('错误', err.message || '');
    }
  }, []);

  const handleViewLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    viewLayout.current = { width, height };
    Image.getSize(imageUri || '', (iw, ih) => {
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
    }, () => {});
  }, [imageUri]);

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
            saveSticker(`data:image/png;base64,${base64}`);
          })
          .catch((err: any) => {
            setStep('select');
            Alert.alert('分割失败', err.message || '');
          });
      } else {
        setStep('select');
        Alert.alert('提示', '此功能目前仅支持 Android');
      }
    },
    [imageUri]
  );

  const handleUse = useCallback(() => {
    if (result) onStickerReady(result, label.trim());
    reset();
  }, [result, label, onStickerReady, reset]);

  const handleSaveFav = useCallback(() => {
    if (result && onSaveAsFavorite) {
      onSaveAsFavorite(result, label.trim());
      setSavedAsFav(true);
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
              <PressableBounce onPress={() => openPicker('camera')} scaleTo={0.92} style={styles.actionBtn}>
                <Text style={styles.actionBtnText}>📷 拍照</Text>
              </PressableBounce>
              <PressableBounce onPress={() => openPicker('album')} scaleTo={0.92} style={styles.actionBtn}>
                <Text style={styles.actionBtnText}>🖼 相册</Text>
              </PressableBounce>
            </View>
            <PressableBounce onPress={reset} scaleTo={0.92} style={styles.cancelBtn}>
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
        <View style={styles.topBar}>
          <PressableBounce onPress={reset} scaleTo={0.85} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </PressableBounce>
          <Text style={styles.topTitle}>
            {step === 'select' ? '点击饮品主体' : step === 'processing' ? '处理中...' : '贴纸预览'}
          </Text>
          <View style={styles.closeBtn} />
        </View>

        <View style={styles.imageArea}>
          <View style={styles.imageOuter} onLayout={handleViewLayout}>
            {imageUri && (
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
                  {step === 'select' && (
                    <View style={styles.tapHint}>
                      <Text style={styles.tapHintText}>👆 点击你想抠出的饮品</Text>
                    </View>
                  )}
                </View>
              </TouchableWithoutFeedback>
            )}
          </View>
        </View>

        {step === 'processing' && (
          <View style={styles.processingBar}>
            <ActivityIndicator size="large" color={Colors.tarotGold} />
            <Text style={styles.processingText}>MobileSAM 分割中...</Text>
          </View>
        )}

        {step === 'result' && result && (
          <View style={styles.resultBar}>
            <View style={styles.resultPreview}>
              <Image source={{ uri: result }} style={styles.resultImg} resizeMode="contain" />
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
              <PressableBounce onPress={handleUse} scaleTo={0.92} style={styles.useBtn}>
                <Text style={styles.useBtnText}>使用贴纸</Text>
              </PressableBounce>
              {onSaveAsFavorite && !savedAsFav && (
                <PressableBounce onPress={handleSaveFav} scaleTo={0.92} style={styles.favBtn}>
                  <Text style={styles.favBtnText}>⭐ 保存常用</Text>
                </PressableBounce>
              )}
              {savedAsFav && (
                <Text style={styles.favDoneText}>已保存 ✓</Text>
              )}
              <PressableBounce onPress={reset} scaleTo={0.92} style={styles.retryBtn}>
                <Text style={styles.retryText}>重选</Text>
              </PressableBounce>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: Colors.overlay },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.cardBg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 36, paddingTop: 14, minHeight: 300, alignItems: 'center',
  },
  handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: Colors.textSecondary, marginBottom: 16 },
  pickArea: { alignItems: 'center', width: '100%' },
  title: { color: Colors.white, fontSize: 18, fontWeight: '600', marginBottom: 6 },
  hint: { color: Colors.textMuted, fontSize: 12, textAlign: 'center', marginBottom: 20 },
  btnRow: { flexDirection: 'row', gap: 14, marginBottom: 14 },
  actionBtn: {
    paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16,
    backgroundColor: Colors.cellBg, borderWidth: 1, borderColor: Colors.tarotGold,
  },
  actionBtnText: { color: Colors.white, fontSize: 16 },
  cancelBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 14, backgroundColor: Colors.tarotCardBack },
  cancelText: { color: Colors.textMuted, fontSize: 14 },
  fullScreen: {
    flex: 1, backgroundColor: Colors.bgDark, paddingTop: 44,
  },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  topTitle: { color: Colors.white, fontSize: 18, fontWeight: '600' },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.cellBg,
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { color: Colors.textMuted, fontSize: 18 },
  imageArea: { flex: 1, padding: 16 },
  imageOuter: { flex: 1 },
  imageTouchable: { flex: 1 },
  imageFit: {
    flex: 1, width: '100%', height: '100%',
    borderRadius: 12, backgroundColor: Colors.cellBg,
  },
  tapHint: {
    position: 'absolute', bottom: 16, alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
  },
  tapHintText: { color: Colors.white, fontSize: 13 },
  processingBar: { alignItems: 'center', paddingVertical: 30 },
  processingText: { color: Colors.textMuted, fontSize: 13, marginTop: 12 },
  resultBar: { alignItems: 'center', paddingBottom: 40, paddingHorizontal: 16 },
  resultPreview: {
    padding: 5, backgroundColor: Colors.white, borderRadius: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 6, elevation: 6,
  },
  resultImg: { width: 220, height: 220, borderRadius: 14 },
  labelInput: {
    color: Colors.white,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: Colors.cellBg,
    minWidth: 200,
  },
  resultBtns: { flexDirection: 'row', gap: 14, marginTop: 20 },
  useBtn: {
    paddingHorizontal: 36, paddingVertical: 14, borderRadius: 16,
    backgroundColor: Colors.tarotPurple, borderWidth: 1, borderColor: Colors.tarotGold,
  },
  useBtnText: { color: Colors.white, fontSize: 16, fontWeight: '600', includeFontPadding: false },
  favBtn: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 16,
    backgroundColor: Colors.cellBg, borderWidth: 1, borderColor: Colors.tarotGold,
    justifyContent: 'center',
  },
  favBtnText: { color: Colors.tarotGold, fontSize: 13, fontWeight: '600', includeFontPadding: false },
  favDoneText: { color: Colors.tarotGold, fontSize: 13, fontWeight: '600', paddingVertical: 10, includeFontPadding: false },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, backgroundColor: Colors.cellBg, justifyContent: 'center' },
  retryText: { color: Colors.textSecondary, fontSize: 14, includeFontPadding: false },
});
