import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Pattern, Circle, Rect } from 'react-native-svg';
import { Colors } from '../../styles/colors';

type PaperBackgroundProps = {
  style?: ViewStyle;
  intensity?: 'subtle' | 'normal' | 'strong';
};

export function PaperBackground({ style, intensity = 'normal' }: PaperBackgroundProps) {
  const dotOpacity = intensity === 'subtle' ? 0.04 : intensity === 'strong' ? 0.12 : 0.07;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <LinearGradient
        colors={[Colors.bg, Colors.bgDark, Colors.bgDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Svg
        width="100%"
        height="100%"
        style={StyleSheet.absoluteFill}
        preserveAspectRatio="xMidYMid slice"
      >
        <Defs>
          <Pattern id="grain" x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse">
            <Circle cx="1.5" cy="1.5" r="0.35" fill={Colors.paperEdge} opacity={dotOpacity} />
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grain)" />
      </Svg>
    </View>
  );
}