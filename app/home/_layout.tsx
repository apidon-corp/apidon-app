import { useNotification } from "@/providers/NotificationProvider";
import {
  AntDesign,
  Entypo,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Tabs, router, usePathname } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, StatusBar, View } from "react-native";

import { homeScreeenParametersAtom } from "@/atoms/homeScreenAtom";
import { useSetAtom } from "jotai";
import { useInAppPurchases } from "@/hooks/useInAppPurchases";

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
          name="create"
          options={{
            headerTitle: "Create Post",
            tabBarIcon: () => (
              <Entypo name="circle-with-plus" size={25} color="white" />
            ),
            tabBarLabel: () => <></>,
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
