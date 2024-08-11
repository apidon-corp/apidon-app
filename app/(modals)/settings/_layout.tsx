import { Stack } from "expo-router";
import React from "react";

const _layout = () => {
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerStyle: {
          backgroundColor: "black",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Settings",
        }}
      />
      <Stack.Screen
        name="notificationSettings"
        options={{
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="passwordDeleteAccount"
        options={{
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="identitySettings"
        options={{
          headerTitle: "Verification",
        }}
      />
    </Stack>
  );
};

export default _layout;
