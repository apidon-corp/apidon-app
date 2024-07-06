import { Stack } from "expo-router";
import React from "react";

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Apidon Collectibles",
        }}
      />
      <Stack.Screen
        name="post"
        options={{
          title: "Wall",
          headerBackTitle: "Market",
        }}
      />
    </Stack>
  );
};

export default _layout;
