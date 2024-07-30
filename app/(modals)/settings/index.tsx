import DeleteAccount from "@/components/Settings/DeleteAccount";
import SignOut from "@/components/User/SignOut";
import React from "react";
import { View } from "react-native";

const settings = () => {
  return (
    <View
      style={{
        flex: 1,
        padding: 10,
        gap: 10,
      }}
    >
      <SignOut />
      <DeleteAccount />
    </View>
  );
};

export default settings;
