import { Text } from "@/components/Text/Text";
import { router } from "expo-router";
import React from "react";
import { Pressable } from "react-native";

const NotificationSettings = () => {
  const handlePressButton = () => {
    router.push("/(modals)/settings/notificationSettings");
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
        Notification Settings
      </Text>
      <Text style={{ fontSize: 12, color: "gray" }} bold>
        Manage your notification preferences to stay updated with the latest
        activities on Apidon.
      </Text>
    </Pressable>
  );
};

export default NotificationSettings;
