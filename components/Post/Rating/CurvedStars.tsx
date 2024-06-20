import { View, Text } from "react-native";
import React from "react";
import { FontAwesome } from "@expo/vector-icons";

const CurvedStars = () => {
  return (
    <View
      style={{
        gap: 1,
        flexDirection: "row",
        transform: [
          {
            translateY : -100
          }
        ]
      }}
    >
      <FontAwesome name="star" size={24} color="white" />
      <FontAwesome name="star" size={24} color="white" />
      <FontAwesome name="star" size={24} color="white" />
      <FontAwesome name="star" size={24} color="white" />
      <FontAwesome name="star" size={24} color="white" />
    </View>
  );
};

export default CurvedStars;
