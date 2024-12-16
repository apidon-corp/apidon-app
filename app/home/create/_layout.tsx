import { Stack } from "expo-router";
import React from "react";

import { Platform } from "react-native";

const _layout = () => {
  const isIOS = Platform.OS === "ios";

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
        options={{
          title: "Create Post",
          headerLargeTitle: isIOS ? true : undefined,
          headerTitleStyle: isIOS
            ? undefined
            : { color: "white", fontWeight: "bold", fontSize: 28 },
        }}
      />
      <Stack.Screen name="details" options={{ title: "Details" }} />
    </Stack>
  );
};

export default _layout;
