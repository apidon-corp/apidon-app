import { Stack } from "expo-router";
import React from "react";

type Props = {};

const _layout = (props: Props) => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Referral",
        }}
      />
      <Stack.Screen
        name="secondPhase"
        options={{
          headerShown: false,
          headerTitle: "Email",
        }}
      />
      <Stack.Screen
        name="verification"
        options={{
          headerTitle: "",
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default _layout;
