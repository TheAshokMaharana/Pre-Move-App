// src/components/AddressBar.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import LinearGradient from 'react-native-linear-gradient';
import GradientBackground from './GradientBackground';

const Header = () => (
  <GradientBackground style={styles.wrap}>
    {/* <Text style={styles.textmain}>PreMove</Text> */}
  </GradientBackground>
);

const styles = StyleSheet.create({
  text: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  wrap: {
    height: 45,
    justifyContent: 'center',
    // borderBottomLeftRadius: 30,
    // borderBottomRightRadius: 30,
  },
  textmain: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
});

export default Header;
