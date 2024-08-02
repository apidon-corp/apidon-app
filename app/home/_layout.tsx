import { useNotification } from "@/providers/NotificationProvider";
import {
  AntDesign,
  Entypo,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Tabs, router } from "expo-router";
import React from "react";
import { Pressable, StatusBar, View } from "react-native";

import auth from "@react-native-firebase/auth";
import { useSetAtom } from "jotai";
import { homeScreeenParametersAtom } from "@/atoms/homeScreenAtom";

const _layout = () => {
  const notificationData = useNotification();

  const setHomeScreenParameters = useSetAtom(homeScreeenParametersAtom);

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

  const handleHomeButtonPress = () => {
    router.replace("/home");
    setHomeScreenParameters({ isHomeButtonPressed: true });
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: () => (
              <Pressable onPress={handleHomeButtonPress}>
                <Entypo name="home" size={25} color="white" />
              </Pressable>
            ),
            tabBarLabel: () => <></>,
            headerBackground: () => (
              <View style={{ flex: 1, backgroundColor: "black", height: 50 }} />
            ),

            headerTitle: "Apidon",

            headerRight: () => (
              <Pressable
                onPress={() => {
                  const currentUserDisplayName =
                    auth().currentUser?.displayName;
                  if (!currentUserDisplayName) return;

                  router.replace(`home/profile/${currentUserDisplayName}`);
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
          name="search"
          options={{
            tabBarIcon: () => (
              <AntDesign name="search1" size={25} color="white" />
            ),
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
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="collectibles"
          options={{
            tabBarIcon: () => (
              <MaterialCommunityIcons name="shopping" size={25} color="white" />
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
      </Tabs>
    </>
  );
};

export default _layout;
