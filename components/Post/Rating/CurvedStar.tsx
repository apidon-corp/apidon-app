import { FontAwesome } from "@expo/vector-icons";
import React from "react";

type Location = {
  x: number;
  y: number;
};

type Props = {
  rateValue: number;
  location: Location;
  index: number;
};

const CurvedStar = ({ rateValue, location, index }: Props) => {
  return (
    <FontAwesome
      name={rateValue >= index + 1 ? "star" : "star-o"}
      size={40}
      color="white"
      style={{
        position: "absolute",
        transform: [{ translateX: location.x }, { translateY: location.y }],
      }}
    />
  );
};

export default CurvedStar;
