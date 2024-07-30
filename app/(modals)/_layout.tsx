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
          name="createNFT"
          options={{
            presentation: "modal",
            title: "Create NFT",
          }}
        />
        <Stack.Screen
          name="listNFT"
          options={{
            presentation: "modal",
            title: "List NFT",
          }}
        />
        <Stack.Screen
          name="buyNFT"
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
