import { Stack } from "expo-router";

import React from "react";
import { StatusBar } from "react-native";

import { Text } from "@/components/Text/Text";

const _layout = () => {
  return (
    <>
      <StatusBar barStyle="light-content" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "black",
          },
          headerShadowVisible: false,
        }}
      >
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
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen
          name="followers"
          options={{
            headerShown: true,
            title: "Followers",

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

            headerTitle: () => (
              <Text style={{ color: "white", fontSize: 18 }}>Following</Text>
            ),
          }}
        />
        <Stack.Screen
          name="post"
          options={{
            headerShown: true,
            title: "Post",
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
        <Stack.Screen
          name="settings"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="createCollectible"
          options={{
            title: "Create Collectible",
          }}
        />

        <Stack.Screen
          name="getPinkTick"
          options={{
            title: "Get Pink Tick",
            headerBackTitleVisible: false,
          }}
        />

        <Stack.Screen
          name="buyCollectible"
          options={{
            title: "Collect",
          }}
        />
        <Stack.Screen
          name="collectors"
          options={{
            title: "Collectors",
          }}
        />
        <Stack.Screen
          name="wallet"
          options={{
            title: "Wallet",
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
          }}
        />
      </Stack>
    </>
  );
};

export default _layout;
