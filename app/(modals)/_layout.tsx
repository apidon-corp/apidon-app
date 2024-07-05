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
          name="replets"
          options={{
            title: "Replets",
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
          name="initialProvider"
          options={{
            title: "Choose Provider",
          }}
        />
        <Stack.Screen
          name="createNFT"
          options={{
            presentation: "modal",
            title: "Create NFT",
          }}
        />
      </Stack>
    </>
  );
};

export default _layout;
