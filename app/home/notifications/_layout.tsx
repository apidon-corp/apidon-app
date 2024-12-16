import { Stack } from "expo-router";
import React from "react";

import { Text } from "@/components/Text/Text";

import { Platform } from "react-native";

const _layout = () => {
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
          headerTitle: "Notifications",
          headerLargeTitle: isIOS ? true : false,
          headerTitleStyle: isIOS
            ? undefined
            : { color: "white", fontWeight: "bold", fontSize: 28 },
        }}
      />
      <Stack.Screen
        name="profilePage"
        options={{
          headerShown: true,
          headerTitle: "",
          //   headerBackTitle: "Back",
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
          title: "Post",
          //    headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="rates"
        options={{
          title: "Rates",
          //     headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="comments"
        options={{
          title: "Comments",
          //     headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
};

export default _layout;
