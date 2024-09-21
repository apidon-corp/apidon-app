import { Tabs, router, usePathname } from "expo-router";
import React from "react";
import { StatusBar } from "react-native";

import { homeScreeenParametersAtom } from "@/atoms/homeScreenAtom";
import MyTabBar from "@/components/TabBar/TabBar";
import { useSetAtom } from "jotai";

const _layout = () => {
  const pathname = usePathname();

  const setHomeScreenParameters = useSetAtom(homeScreeenParametersAtom);

  const handleHomeButtonPress = () => {
    if (pathname === "/home/feed")
      return setHomeScreenParameters({ isHomeButtonPressed: true });

    router.navigate("/home/feed");
  };

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
            headerTitle: "Create Post",
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
