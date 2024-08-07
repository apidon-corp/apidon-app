import { useNotification } from "@/providers/NotificationProvider";
import {
  AntDesign,
  Entypo,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Tabs, router, usePathname } from "expo-router";
import React from "react";
import { Pressable, StatusBar, View } from "react-native";

import auth from "@react-native-firebase/auth";
import { useSetAtom } from "jotai";
import { homeScreeenParametersAtom } from "@/atoms/homeScreenAtom";

const _layout = () => {
  const notificationData = useNotification();

  const pathname = usePathname();

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
    if (pathname === "/home/feed")
      setHomeScreenParameters({ isHomeButtonPressed: true });
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="feed"
          options={{
            headerShown: false,
            tabBarButton: () => (
              <Pressable
                onPress={handleHomeButtonPress}
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Entypo name="home" size={25} color="white" />
              </Pressable>
            ),
            tabBarLabel: () => <></>,
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
      </Tabs>
    </>
  );
};

export default _layout;
