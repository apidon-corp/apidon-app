import GetPinkTick from "@/components/Settings/GetPinkTick";
import IdentitySettings from "@/components/Settings/IdentitySettings";
import NotificationSettings from "@/components/Settings/NotificationSettings";
import Text from "@/components/Text/Text";
import SignOut from "@/components/User/SignOut";
import { router } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";

const settings = () => {
  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        alignItems: "center",
        padding: 10,
        gap: 10,
      }}
    >
      <NotificationSettings />
      <IdentitySettings />
      <GetPinkTick />
      <SignOut />

      <View
        style={{
          width: "75%",
          height: 1,
          borderWidth: 1,
          borderColor: "gray",
          alignSelf: "center",
          marginVertical: 10,
        }}
      />
      <Pressable
        onPress={() => {
          router.push("/settings/deleteAccount");
        }}
        style={{
          padding: 15,
          borderWidth: 1,
          borderColor: "red",
          borderRadius: 10,
          width: "100%",
          gap: 5,
        }}
      >
        <Text bold style={{ fontSize: 14, color: "red" }}>
          Delete Account
        </Text>
        <Text style={{ fontSize: 12, color: "gray" }} bold>
          Permanently delete your account and all of your data from Apidon. This
          action is irreversible.
        </Text>
      </Pressable>
    </View>
  );
};

export default settings;
