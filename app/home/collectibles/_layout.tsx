import { FontAwesome5 } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React from "react";
import { Pressable } from "react-native";

import { Text } from "@/components/Text/Text";

const _layout = () => {
  const handlePressWalletIcon = () => {
    router.push("/home/collectibles/wallet");
  };

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "black",
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Collectibles",
          headerRight: () => (
            <Pressable
              onPress={handlePressWalletIcon}
              style={{
                width: 45,
                height: 25,
                justifyContent: "center",
                alignItems: "flex-end",
              }}
            >
              <FontAwesome5 name="wallet" size={25} color="white" />
            </Pressable>
          ),
          headerLargeTitle: true,
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
