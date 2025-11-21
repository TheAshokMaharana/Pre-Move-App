// src/components/PillTag.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../theme/colors';

const PillTag = ({ icon = 'flash', children }) => (
  <View style={styles.pill}>
    <Ionicons name={icon} size={16} color={colors.white} />
    <Text style={styles.text}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  text: { color: colors.white, fontSize: 12.5, fontWeight: '600' },
});

export default PillTag;
