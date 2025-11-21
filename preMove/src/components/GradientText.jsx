// components/GradientText.js
import React from "react";
import { Text } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import LinearGradient from "react-native-linear-gradient";

const GradientText = ({ text, style }) => {
  return (
    <MaskedView
      maskElement={
        <Text style={[style, { backgroundColor: "transparent" }]}>{text}</Text>
      }
    >
      <LinearGradient
        colors={["#03B5A7", "#0189D5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={[style, { opacity: 0}]}>{text}</Text>
      </LinearGradient>
    </MaskedView>
  );
};

export default GradientText;
