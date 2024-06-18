import { View } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { FontAwesome, Ionicons } from "@expo/vector-icons";

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
          // headerRight: () => (
          //   <Ionicons name="notifications" color="white" size={23} style={{}} />
          // ),
          // headerLeft: () => (
          //   <FontAwesome name="chain" color="white" size={23} style={{}} />
          // ),
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