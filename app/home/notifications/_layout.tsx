import { Stack } from "expo-router";
import React from "react";

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
      <Stack.Screen name="index" options={{ headerTitle: "Notifications" }} />
      <Stack.Screen
        name="profilePage"
        options={{
          headerShown: true,
          headerTitle: "",
          headerBackTitle: "Back",
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
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
};

export default _layout;
