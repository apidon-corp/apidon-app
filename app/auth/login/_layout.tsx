import { Stack } from "expo-router";
import React from "react";

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Back",
        }}
      />
      <Stack.Screen
        name="password"
        options={{
          title: "",
        }}
      />
      <Stack.Screen
        name="passwordReset"
        options={{
          title: "",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="passwordResetSend"
        options={{
          title: "",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="extraInformation"
        options={{
          headerTitle: "",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
};

export default _layout;
