import React from 'react';
import { TouchableOpacity } from 'react-native';
import { ArrowLeftIcon } from 'react-native-heroicons/solid'; // ya tumhare icon library ke hisaab se

export default function BackButton({ onPress, size = 25, color = '#03B5A7', style = {} }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width:40,
        justifyContent:'center',
        alignItems:'center',
        padding: 8,
        borderRadius: 50,
        backgroundColor: '#eaffe4ff',
        ...style,
        marginRight:10
      }}
    >
      <ArrowLeftIcon size={size} color={color} />
    </TouchableOpacity>
  );
}
