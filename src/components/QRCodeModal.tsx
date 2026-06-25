import React from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Colors } from '../styles/colors';
import PressableBounce from './PressableBounce';

interface Props {
  visible: boolean;
  code: string;
  onClose: () => void;
}

export default function QRCodeModal({ visible, code, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>我的好友码</Text>
          <View style={styles.qrWrap}>
            {code ? (
              <QRCode value={code} size={200} backgroundColor="#fff" color="#000" />
            ) : null}
          </View>
          <Text style={styles.code}>{code}</Text>
          <PressableBounce onPress={onClose} scaleTo={0.92} style={styles.btn}>
            <Text style={styles.btnText}>关闭</Text>
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
    padding: 28,
    alignItems: 'center',
  },
  title: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  qrWrap: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
  },
  code: {
    color: Colors.tarotGold,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    letterSpacing: 2,
  },
  btn: {
    marginTop: 20,
    backgroundColor: Colors.cellBg,
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 10,
  },
  btnText: { color: Colors.white, fontSize: 14 },
});
