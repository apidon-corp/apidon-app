import { FontAwesome5 } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React from "react";
import { Pressable, Platform } from "react-native";

import { Text } from "@/components/Text/Text";
import { Environment } from "@/types/Environment";

const _layout = () => {
  const environment =
    (process.env.EXPO_PUBLIC_ENVIRONMENT as Environment) || "";

  const handlePressWalletIcon = () => {
    router.push("/home/collectibles/wallet");
  };

  const isIOS = Platform.OS === "ios";

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
          headerStyle: isIOS ? { backgroundColor: undefined } : {backgroundColor : "black"},
          title: "Collectibles",
          headerRight: () => (
            <Pressable
              onPress={handlePressWalletIcon}
              style={{
                width: 45,
                height: 25,
                justifyContent: "center",
                alignItems: "flex-end",
                display:
                  environment && environment !== "PRODUCTION" ? "flex" : "none",
              }}
            >
              <FontAwesome5 name="wallet" size={25} color="white" />
            </Pressable>
          ),
          headerTransparent: isIOS ? true : undefined,
          headerBlurEffect: isIOS ? "dark" : undefined,
          headerLargeTitle: isIOS ? true : undefined,
          headerLargeStyle: isIOS ? { backgroundColor: "black" } : undefined,
          headerTitleStyle: isIOS
            ? undefined
            : { color: "white", fontWeight: "bold", fontSize: 28 },
        }}
      />

      <Stack.Screen
        name="wallet"
        options={{
          title: "Wallet",
          headerTitle: "Wallet",
        }}
      />

      <Stack.Screen
        name="withdraw"
        options={{
          title: "Withdraw",
          headerBackTitle: "Wallet",
        }}
      />

      <Stack.Screen
        name="withdrawRequest"
        options={{
          title: "Request",
          headerBackTitle: "Withdraw",
        }}
      />

      <Stack.Screen
        name="requestWithdraw"
        options={{
          title: "Request Withdraw",
          headerBackTitle: "Withdraw",
        }}
      />

      <Stack.Screen
        name="identity"
        options={{
          title: "Identity",
          headerBackTitle: "Request",
        }}
      />

      <Stack.Screen
        name="profilePage"
        options={{
          headerShown: true,
          headerTitle: "@",
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
        }}
      />
      <Stack.Screen
        name="rates"
        options={{
          title: "Rates",
        }}
      />
      <Stack.Screen
        name="comments"
        options={{
          title: "Comments",
        }}
      />
    </Stack>
  );
};

export default _layout;
