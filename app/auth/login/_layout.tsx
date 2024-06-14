import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

type Props = {};

const _layout = (props: Props) => {
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
    </Stack>
  );
};

export default _layout;
