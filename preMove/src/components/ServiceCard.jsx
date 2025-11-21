// src/components/ServiceCard.jsx
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import colors from '../theme/colors';
// import styles from '../assets/css/components'
import { InventoryItem } from '../assets/css/components';


const ServiceCard = ({ title, source }) => (
  <View style={InventoryItem.card}>
    {/* replace the placeholder with your asset */}
    <Image source={source} style={InventoryItem.img} resizeMode="contain" />
    <Text style={InventoryItem.title}>{title}</Text>
  </View>
);


export default ServiceCard;
