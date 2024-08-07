import { Stack } from "expo-router";
import React from "react";
import { View } from "react-native";
import { Text } from "@/components/Text/Text";

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="[username]"
        options={{
          headerShown: false,
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
          presentation: "card",
          headerTitle: () => (
            <Text style={{ color: "white", fontSize: 18 }}>Following</Text>
          ),
          headerBackground: () => (
            <View style={{ flex: 1, backgroundColor: "black" }} />
          ),
        }}
      />
      <Stack.Screen
        name="post"
        options={{
          headerBackground: () => (
            <View style={{ flex: 1, backgroundColor: "black" }} />
          ),
          headerShown: true,
          title: "Post",
        }}
      />
    </Stack>
  );
};

export default _layout;
