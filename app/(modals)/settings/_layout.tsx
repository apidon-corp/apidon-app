import { Stack } from "expo-router";
import React from "react";

const _layout = () => {
  return (
    <Stack initialRouteName="index">
      <Stack.Screen
        name="index"
        options={{
          title: "Settings",
        }}
      />
      <Stack.Screen
        name="passwordDeleteAccount"
        options={{
          headerTitle: "",
        }}
      />
    </Stack>
  );
};

export default _layout;
