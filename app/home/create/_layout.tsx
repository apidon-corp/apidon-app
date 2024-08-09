import { Stack } from "expo-router";
import React from "react";

const _layout = () => {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#000",
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: "Pick Image", headerLargeTitle: true }}
      />
      <Stack.Screen name="details" options={{ title: "Details" }} />
    </Stack>
  );
};

export default _layout;
