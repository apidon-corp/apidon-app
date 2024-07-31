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
          headerBackground: () => (
            <View style={{ width: "100%", backgroundColor: "black" }} />
          ),
          title: "Search",
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          headerBackground: () => (
            <View style={{ width: "100%", backgroundColor: "black" }} />
          ),
          headerTitle: "",
          presentation: "card",
        }}
      />
    </Stack>
  );
};

export default _layout;
