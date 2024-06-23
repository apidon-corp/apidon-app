import React from "react";
import { View } from "react-native";
import CurvedStar from "./CurvedStar";

type Props = {
  rateValue: number;
  setRateValue: (value: number) => void;
};

const CurvedStars = ({ rateValue, setRateValue }: Props) => {
  return (
    <View
      style={{
        gap: 30,
        flexDirection: "row",
        transform: [
          {
            translateY: -20,
          },
        ],
      }}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <CurvedStar index={i} rateValue={rateValue} key={i} />
      ))}
    </View>
  );
};

export default CurvedStars;
