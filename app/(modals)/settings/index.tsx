import { View, Pressable } from "react-native";
import React from "react";
import { Text } from "@/components/Text/Text";
import { router } from "expo-router";

const settings = () => {
  return (
    <View
      style={{
        flex: 1,
        padding: 10,
      }}
    >
      <Pressable
        style={{
          padding: 15,
          borderWidth: 1,
          borderColor: "gray",
          borderRadius: 10,
          width: "100%",
        }}
        onPress={() => {
          router.push("/(modals)/settings/provider");
        }}
      >
        <Text bold style={{ fontSize: 14 }}>
          Provider Settings
        </Text>
        <Text style={{ fontSize: 12, color: "gray" }} bold>
          View and manage your provider settings. Here, you can see your active
          provider, review your profits, rate your provider, and switch to other
          available providers.
        </Text>
      </Pressable>
    </View>
  );
};

export default settings;
