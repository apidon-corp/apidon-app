import MyTabBar from "@/components/TabBar/TabBar";
import { Tabs } from "expo-router";
import React from "react";
import { StatusBar } from "react-native";

const _layout = () => {
  return (
    <>
      <StatusBar barStyle="light-content" />
      <Tabs tabBar={(props) => <MyTabBar {...props} />}>
        <Tabs.Screen
          name="feed"
          options={{
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="collectibles"
          options={{
            headerShown: false,
          }}
        />
      </Tabs>
    </>
  );
};

export default _layout;
