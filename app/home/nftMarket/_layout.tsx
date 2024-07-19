import auth from "@/app/auth";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React from "react";
import { Pressable } from "react-native";

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Apidon Collectibles",
          headerRight: () => (
            <Pressable
              onPress={() => {
                router.push("/home/nftMarket/wallet");
              }}
            >
              <FontAwesome5 name="wallet" size={24} color="white" />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="post"
        options={{
          title: "Wall",
          headerBackTitle: "Market",
        }}
      />
      <Stack.Screen
        name="wallet"
        options={{
          title: "Wallet",
          headerTitle: "Wallet",
          headerBackTitle: "Market",
        }}
      />
    </Stack>
  );
};

export default _layout;
