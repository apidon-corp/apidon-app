import { FontAwesome5 } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React from "react";
import { Pressable } from "react-native";

import { Text } from "@/components/Text/Text";

const _layout = () => {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "black",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Apidon Collectibles",
          headerRight: () => (
            <Pressable
              onPress={() => {
                router.push("/home/collectibles/wallet");
              }}
            >
              <FontAwesome5 name="wallet" size={24} color="white" />
            </Pressable>
          ),
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

      <Stack.Screen
        name="profilePage"
        options={{
          headerShown: true,
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="editProfile"
        options={{
          headerShown: true,
          title: "Edit Profile",
          presentation: "card",
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="followers"
        options={{
          headerShown: true,
          title: "Followers",
          presentation: "card",
          headerTitle: () => (
            <Text style={{ color: "white", fontSize: 18 }}>Followers</Text>
          ),
        }}
      />
      <Stack.Screen
        name="following"
        options={{
          headerShown: true,
          title: "Following",
          presentation: "card",
          headerTitle: () => (
            <Text style={{ color: "white", fontSize: 18 }}>Following</Text>
          ),
        }}
      />
      <Stack.Screen
        name="post"
        options={{
          title: "Collectible",
          headerBackTitle: "Market",
        }}
      />
    </Stack>
  );
};

export default _layout;
