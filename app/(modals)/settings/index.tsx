import DeleteAccount from "@/components/Settings/DeleteAccount";
import { Text } from "@/components/Text/Text";
import SignOut from "@/components/User/SignOut";
import { router } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";

const settings = () => {
  return (
    <View
      style={{
        flex: 1,
        padding: 10,
        gap: 10,
      }}
    >
      <Pressable
        style={{
          padding: 15,
          borderWidth: 1,
          borderColor: "gray",
          borderRadius: 10,
          width: "100%",
          gap: 5,
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
      <SignOut />
      <DeleteAccount />
    </View>
  );
};

export default settings;
