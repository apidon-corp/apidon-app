import { Stack } from "expo-router";

import React from "react";
import { StatusBar } from "react-native";

const _layout = () => {
  return (
    <>
      <StatusBar barStyle="light-content" />
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
        <Stack.Screen
          name="settings"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="createCollectible"
          options={{
            presentation: "modal",
            title: "Create Collectible",
          }}
        />
        <Stack.Screen
          name="buyCollectible"
          options={{
            presentation: "modal",
            title: "Collect",
          }}
        />
        <Stack.Screen
          name="collectors"
          options={{
            presentation: "modal",
            title: "Collectors",
          }}
        />
        <Stack.Screen
          name="wallet"
          options={{
            title: "Wallet",
          }}
        />
      </Stack>
    </>
  );
};

export default _layout;
