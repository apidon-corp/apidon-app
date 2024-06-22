import { View, Text } from "react-native";
import React from "react";

import { FontAwesome } from "@expo/vector-icons";

type Props = {
  score: number;
};

const Stars = ({ score }: Props) => {
  const filledStarCount = Math.floor(score);
  const halfStar = score - filledStarCount >= 0.29;
  const emptyStarCount = 5 - filledStarCount - (halfStar ? 1 : 0);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
      }}
    >
      {Array.from({ length: filledStarCount }).map((_, i) => (
        <FontAwesome name="star" size={24} color="white" key={i} />
      ))}
      {halfStar && <FontAwesome name="star-half-full" size={24} color="white" />}
      {Array.from({ length: emptyStarCount }).map((_, i) => (
        <FontAwesome name="star-o" size={24} color="white" key={i} />
      ))}
    </View>
  );
};

export default Stars;
