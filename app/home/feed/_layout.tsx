import { FontAwesome } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";

import { Text } from "@/components/Text/Text";

import auth from "@react-native-firebase/auth";

const _layout = () => {
  const handleUserIconButtonPress = () => {
    const currentUserDisplayName = auth().currentUser?.displayName;
    if (!currentUserDisplayName) return;

    router.push(`/home/feed/profilePage?username=${currentUserDisplayName}`);
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
          headerTitle: "Apidon",
          headerRight: () => (
            <Pressable
              onPress={handleUserIconButtonPress}
              style={{
                width: 35,
                height: 25,
                justifyContent: "center",
                alignItems: "flex-end",
              }}
            >
              <FontAwesome name="user" size={25} color="white" />
            </Pressable>
          ),
        }}
      />

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
