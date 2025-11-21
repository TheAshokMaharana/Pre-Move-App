import React from 'react';
import LinearGradient from 'react-native-linear-gradient';

const GradientBackground = ({
  children,
  style,
  colors = ['#03B5A7', '#03B5A7', '#0187d5ff'], // Green ज्यादा
}) => {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 1, y: 0 }}   // top-left corner
      end={{ x: 0, y: 1 }}     // bottom-right corner (cross/diagonal)
      style={style}
    >
      {children}
    </LinearGradient>
  );
};

export default GradientBackground;
