import { AntDesign } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import Text from "../Text/Text";

import { Share } from "react-native";

type Props = {
  code: string;
  isUsed: boolean;
};

const CodeItem = ({ code, isUsed }: Props) => {
  const [copyLoading, setCopyLoading] = useState(false);

  const handleCopyCodeButton = async () => {
    if (copyLoading) return;

    setCopyLoading(true);
    try {
      await Share.share({ message: code, title: "Apidon Code" });
    } catch (error) {
      console.error("Error on sharing code: ", error);
    }
    setCopyLoading(false);
  };

  return (
    <View
      id="verification-info"
      style={{
        backgroundColor: "rgba(255,255,255,0.075)",
        width: "100%",
        alignItems: "center",
        borderRadius: 20,
        padding: 15,
        flexDirection: "row",
      }}
    >
      <View
        style={{
          width: "50%",
          alignItems: "flex-start",
        }}
      >
        <Text
          bold
          fontSize={12}
          style={{
            color: "white",
          }}
        >
          {code}
        </Text>
      </View>

      <View
        style={{
          width: "25%",
          alignItems: "center",
        }}
      >
        <Text
          bold
          fontSize={12}
          style={{
            color: isUsed ? "red" : "green",
          }}
        >
          {isUsed ? "Used" : "Not Used"}
        </Text>
      </View>

      <Pressable
        disabled={copyLoading}
        onPress={handleCopyCodeButton}
        style={{
          width: "25%",
          alignItems: "flex-end",
        }}
      >
        {copyLoading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <AntDesign name="sharealt" size={20} color="white" />
        )}
      </Pressable>
    </View>
  );
};

export default CodeItem;
