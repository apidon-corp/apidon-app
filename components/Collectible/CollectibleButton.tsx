import { Pressable, View } from "react-native";
import React from "react";
import Text from "../Text/Text";

type Props = {
  text: string;
};

const CollectibleButton = ({ text }: Props) => {
  return (
    <Pressable
      style={{
        backgroundColor: "gray",
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "black",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: "black",
        }}
      >
        {text}
      </Text>
    </Pressable>
  );
};

export default CollectibleButton;
