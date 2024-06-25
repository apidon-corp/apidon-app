import { Stack } from "expo-router";
import React from "react";
import { View } from "react-native";

import { Text } from "@/components/Text/Text";

type Props = {};

const _layout = (props: Props) => {
  return (
    <Stack>
      <Stack.Screen
        name="[username]"
        options={{
          headerShown: true,
          headerTitle: () => (
            <Text style={{ color: "white", fontSize: 18 }}>Private</Text>
          ),
          headerBackground: () => (
            <View style={{ flex: 1, backgroundColor: "black" }} />
          ),
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
          headerBackTitleVisible: false,
          headerTitle: () => (
            <Text style={{ color: "white", fontSize: 18 }}>Followers</Text>
          ),
          headerBackground: () => (
            <View style={{ flex: 1, backgroundColor: "black" }} />
          ),
        }}
      />
      <Stack.Screen
        name="following"
        options={{
          headerShown: true,
          title: "Following",
          headerBackTitleVisible: false,
          headerTitle: () => (
            <Text style={{ color: "white", fontSize: 18 }}>Following</Text>
          ),
          headerBackground: () => (
            <View style={{ flex: 1, backgroundColor: "black" }} />
          ),
        }}
      />
    </Stack>
  );
};

export default _layout;
