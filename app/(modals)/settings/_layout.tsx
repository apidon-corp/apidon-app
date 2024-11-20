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
