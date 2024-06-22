import { Stack } from "expo-router";
import React from "react";

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="rates"
        options={{
          title: "Rates",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="comments"
        options={{
          title: "Comments",
          presentation: "modal",
        }}
      />
    </Stack>
  );
};

export default _layout;
