import { Pressable, View } from "react-native";
import React, { useState } from "react";
import Text from "@/components/Text/Text";
import { apidonPink } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";

import * as Clipboard from "expo-clipboard";

import auth from "@react-native-firebase/auth";

const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const getPinkTick = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyButton = async () => {
    const uid = auth().currentUser?.uid || "";
    Clipboard.setStringAsync(uid);
    setCopied(true);
    await delay(2000);
    setCopied(false);
  };

  return (
    <View
      style={{
        padding: 15,
        gap: 15,
        width: "100%",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <MaterialIcons name="verified" size={64} color={apidonPink} />
      <Text fontSize={16} style={{ textAlign: "center" }} bold>
        Become a verified creator on Apidon!
      </Text>
      <Text fontSize={13} style={{ textAlign: "center" }}>
        To get started, simply send a direct message to Apidon's official
        Instagram account (@apidon_com) with your unique UID. You can easily
        copy your UID using the button below. This helps us verify your account
        and grant you the Pink Tick, unlocking special privileges for creators
        like you!
      </Text>
      <Pressable
        disabled={copied}
        onPress={handleCopyButton}
        style={{
          backgroundColor: "white",
          padding: 10,
          borderRadius: 15,
          marginTop: 5,
        }}
      >
        <Text
          bold
          fontSize={12}
          style={{ textAlign: "center", color: "black" }}
        >
          {copied ? "Copied!" : "Copy UID"}
        </Text>
      </Pressable>
    </View>
  );
};

export default getPinkTick;
