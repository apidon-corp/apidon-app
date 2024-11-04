import { Text } from "@/components/Text/Text";
import { router } from "expo-router";
import React from "react";
import { Pressable } from "react-native";

const IdentitySettings = () => {
  const handlePressButton = () => {
    router.push("/(modals)/settings/identity");
  };

  return (
    <Pressable
      onPress={handlePressButton}
      style={{
        padding: 15,
        borderWidth: 1,
        borderColor: "gray",
        borderRadius: 10,
        width: "100%",
        gap: 5,
      }}
    >
      <Text bold style={{ fontSize: 14, color: "white" }}>
        Identity Settings
      </Text>
      <Text style={{ fontSize: 12, color: "gray" }} bold>
        Verify your identity to access all features, enhance account security,
        and comply with platform regulations.
      </Text>
    </Pressable>
  );
};

export default IdentitySettings;
