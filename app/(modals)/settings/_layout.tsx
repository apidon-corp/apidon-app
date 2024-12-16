import { Stack } from "expo-router";
import React from "react";

import { Platform } from "react-native";

const _layout = () => {

  const isIOS = Platform.OS === "ios"

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
          headerShown : isIOS ? undefined : false,
          title: "Settings",
          
        }}
      />
      <Stack.Screen
        name="notificationSettings"
        options={{
          headerTitle: "Notifications",
        }}
      />
      <Stack.Screen
        name="deleteAccount"
        options={{
          headerTitle: "Delete Account",
        }}
      />
      <Stack.Screen
        name="identity"
        options={{
          headerTitle: "Identity",
        }}
      />
      <Stack.Screen
        name="getPinkTick"
        options={{
          headerTitle: "Get Pink Tick",
        }}
      />
    </Stack>
  );
};

export default _layout;
