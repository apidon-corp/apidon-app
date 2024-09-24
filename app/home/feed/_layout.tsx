import { FontAwesome } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable } from "react-native";

import { Text } from "@/components/Text/Text";

import auth from "@react-native-firebase/auth";
import { useAuth } from "@/providers/AuthProvider";
import firestore from "@react-native-firebase/firestore";
import { UserInServer } from "@/types/User";
import { Image } from "expo-image";

const _layout = () => {
  const { authStatus } = useAuth();

  const [profilePhoto, setProfilePhoto] = useState("");

  // Dynamic Data Fetching / Follow Status
  useEffect(() => {
    if (authStatus !== "authenticated") return;

    const displayName = auth().currentUser?.displayName;
    if (!displayName) return;

    const unsubscribe = firestore()
      .doc(`users/${displayName}`)
      .onSnapshot(
        (snapshot) => {
          if (snapshot.exists) {
            const userData = snapshot.data() as UserInServer;
            setProfilePhoto(userData.profilePhoto);
          }
        },
        (error) => {
          console.error("Error on getting realtime user data: ", error);
        }
      );

    return () => unsubscribe();
  }, [authStatus]);

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
        headerBackTitleVisible: false,
        headerBackButtonMenuEnabled: false,
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
              {profilePhoto ? (
                <Image
                  source={profilePhoto}
                  style={{
                    height: "100%",
                    aspectRatio: 1,
                    borderRadius: 25,
                  }}
                />
              ) : (
                <FontAwesome name="user" size={25} color="white" />
              )}
            </Pressable>
          ),
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
    </Stack>
  );
};

export default _layout;
