import { Stack } from "expo-router";
import React from "react";

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: "Notifications" }} />
      <Stack.Screen
        name="profile"
        options={{ headerTitle: "", presentation: "card" }}
      />
    </Stack>
  );
};

export default _layout;
