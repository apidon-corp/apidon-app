import DeleteAccount from "@/components/Settings/DeleteAccount";
import NotificationSettings from "@/components/Settings/NotificationSettings";
import SignOut from "@/components/User/SignOut";
import React from "react";
import { View } from "react-native";

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
      <SignOut />
      <View
        style={{
          height: 1,
          backgroundColor: "gray",
          width: "85%",
          marginVertical: 20,
        }}
      />
      <DeleteAccount />
    </View>
  );
};

export default settings;
