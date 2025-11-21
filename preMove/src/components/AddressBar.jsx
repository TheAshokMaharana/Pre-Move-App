// src/components/AddressBar.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors'
import GradientBackground from '../components/GradientBackground';


const AddressBar = ({ address = 'Saki Naka Mumbai, Maharashtra 400072' }) => (
  <GradientBackground style={styles.wrap}>
    <Text style={styles.textmain}>ADDRESS</Text>
    <Text style={styles.text}>{address}</Text>
  </GradientBackground>
);

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.primary,
    height: 100,
    justifyContent: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    // elevation: 10, // shadow for Android
  },
  text: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  textmain: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
});

export default AddressBar;
