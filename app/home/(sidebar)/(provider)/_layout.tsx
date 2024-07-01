import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

type Props = {};

const _layout = (props: Props) => {
  return (
    <Stack>
      <Stack.Screen
        name="provider"
        options={{
          title: "Provider",
        }}
      />
    </Stack>
  );
};

export default _layout;
