import { useNotification } from "@/providers/NotificationProvider";
import {
  AntDesign,
  Entypo,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Tabs, router } from "expo-router";
import React from "react";
import { Pressable, StatusBar, View } from "react-native";

import { Text } from "@/components/Text/Text";
import { auth } from "@/firebase/client";

const _layout = () => {
  const notificationData = useNotification();

  const areThereUnReadNotifications = () => {
    if (!notificationData) return false;

    let unReadFlag = false;
    for (const notification of notificationData.notifications) {
      if (notification.timestamp > notificationData.lastOpenedTime) {
        unReadFlag = true;
        break;
      }
    }

    return unReadFlag;
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: () => <Entypo name="home" size={25} color="white" />,
            tabBarLabel: () => <></>,
            headerTitle: () => (
              <Text bold style={{ color: "white", fontSize: 18 }}>
                APIDON
              </Text>
            ),
            headerBackground: () => (
              <View style={{ flex: 1, backgroundColor: "black" }} />
            ),
            headerLeft: () => (
              <MaterialCommunityIcons
                name="robot-happy-outline"
                size={24}
                color="white"
                style={{ marginHorizontal: 10 }}
              />
            ),
            headerRight: () => (
              <Pressable
                onPress={() => {
                  const currentUserDisplayName = auth.currentUser?.displayName;
                  if (!currentUserDisplayName) return;

                  router.push(`home/profile/${currentUserDisplayName}`);
                }}
              >
                <AntDesign
                  name="user"
                  size={24}
                  color="white"
                  style={{ marginHorizontal: 10 }}
                />
              </Pressable>
            ),
          }}
        />
        <Tabs.Screen
          name="highRates"
          options={{
            tabBarIcon: () => <Entypo name="star" size={25} color="white" />,
            tabBarLabel: () => <></>,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="postCreate"
          options={{
            tabBarIcon: () => (
              <Entypo name="circle-with-plus" size={25} color="white" />
            ),
            tabBarLabel: () => <></>,
            title: "Create Post",
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            tabBarIcon: () => (
              <View
                style={{
                  position: "relative",
                }}
              >
                <Ionicons name="notifications" size={25} color="white" />
                {areThereUnReadNotifications() && (
                  <Entypo
                    style={{
                      position: "absolute",
                      bottom: -5,
                      left: -5,
                    }}
                    name="dot-single"
                    size={50}
                    color="red"
                  />
                )}
              </View>
            ),
            tabBarLabel: () => <></>,
            title: "Notifications",
          }}
        />
        <Tabs.Screen
          name="(sidebar)"
          options={{
            tabBarIcon: () => (
              <Feather name="sidebar" size={25} color="white" />
            ),
            tabBarLabel: () => <></>,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            headerShown: false,
            title: "Private",
            href: null,
          }}
        />
        <Tabs.Screen
          name="post"
          options={{
            headerShown: true,
            title: "Post",
            href: null,
          }}
        />
        <Tabs.Screen
          name="frenlet"
          options={{
            headerShown: true,
            title: "Frenlet",
            href: null,
          }}
        />
      </Tabs>
    </>
  );
};

export default _layout;
