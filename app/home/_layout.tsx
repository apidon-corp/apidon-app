import { Tabs } from "expo-router";
import React from "react";

import { Entypo, Feather } from "@expo/vector-icons";

type Props = {};

const _layout = (props: Props) => {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: () => <Entypo name="home" size={25} color="white" />,
          tabBarLabel: () => <></>,
          headerShown: false,
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
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="contentPreference"
        options={{
          tabBarIcon: () => <Feather name="radio" size={25} color="white" />,
          tabBarLabel: () => <></>,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="sidebar"
        options={{
          tabBarIcon: () => <Feather name="sidebar" size={23} color="white" />,
          tabBarLabel: () => <></>,
          headerShown: false,
        }}
      />
    </Tabs>
  );
};

export default _layout;
