import { useNotification } from "@/providers/NotificationProvider";
import {
  AntDesign,
  Entypo,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Tabs, router, usePathname } from "expo-router";
import React from "react";
import { Pressable, StatusBar, View } from "react-native";

import { homeScreeenParametersAtom } from "@/atoms/homeScreenAtom";
import { useInAppPurchases } from "@/hooks/useInAppPurchases";
import { useSetAtom } from "jotai";

const _layout = () => {
  const notificationData = useNotification();

  const pathname = usePathname();

  // To Trigger In-App-Purchase to sent store notifications for expiration.
  useInAppPurchases();

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
    if (pathname === "/home/feed")
      return setHomeScreenParameters({ isHomeButtonPressed: true });

    router.navigate("/home/feed");
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <Tabs
        screenOptions={{
          headerStyle: {
            backgroundColor: "rgba(255,255,255,0.04)",
          },
          headerShadowVisible: false,
          tabBarInactiveTintColor: "gray",
          tabBarActiveTintColor: "white",
        }}
      >
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
            tabBarIcon: ({ color, size }) => (
              <Pressable
                onPress={handleHomeButtonPress}
                style={{
                  width: "100%",
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Entypo name="home" size={size} color={color} />
              </Pressable>
            ),
            tabBarLabel: () => <></>,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            tabBarIcon: ({ color, size }) => (
              <AntDesign name="search1" size={size} color={color} />
            ),
            tabBarLabel: () => <></>,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            headerTitle: "Create Post",
            tabBarIcon: ({ color, size }) => (
              <Entypo name="circle-with-plus" size={size} color={color} />
            ),
            tabBarLabel: () => <></>,
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            tabBarIcon: ({ size, color }) => (
              <View
                style={{
                  position: "relative",
                }}
              >
                <Ionicons name="notifications" size={size} color={color} />
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
            tabBarIcon: ({ size, color }) => (
              <MaterialCommunityIcons
                name="shopping"
                size={size}
                color={color}
              />
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
