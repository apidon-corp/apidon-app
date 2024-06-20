import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";

type Props = {
  index: number;
  rateValue: number;
};

const CurvedStar = ({ rateValue, index }: Props) => {
  return (
    <View>
      <FontAwesome
        name={rateValue >= index + 1 ? "star" : "star-o"}
        size={40}
        color="yellow"
        style={{
          transform: [
            {
              translateY:
                index === 0
                  ? 0
                  : index === 1
                  ? -40
                  : index === 2
                  ? -80
                  : index == 3
                  ? -40
                  : 0,
            },
          ],
        }}
      />
    </View>
  );
};

export default CurvedStar;
