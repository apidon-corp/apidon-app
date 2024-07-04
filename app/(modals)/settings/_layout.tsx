import { Stack } from "expo-router";
import React from "react";

const _layout = () => {
  return (
    <Stack initialRouteName="index">
      <Stack.Screen
        name="index"
        options={{
          title: "Settings",
        }}
      />
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
