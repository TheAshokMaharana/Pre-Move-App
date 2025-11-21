// src/components/PrimaryButton.jsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import colors from '../theme/colors';
import GradientBackground from './GradientBackground';

const PrimaryButton = ({ title, onPress, style, textStyle }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    style={[styles.container, style]}
  >
    <GradientBackground style={styles.gradient}>
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </GradientBackground>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    overflow: 'hidden', // 👈 zaruri hai taaki gradient corners follow kare
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  gradient: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default PrimaryButton;
