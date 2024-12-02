import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useEffect, useRef, useState } from "react";
import { Animated, Platform, View } from "react-native";
import TabBarButton from "./TabBarButton";

import { homeScreeenParametersAtom } from "@/atoms/homeScreenAtom";
import { useNotification } from "@/providers/NotificationProvider";
import { useSetAtom } from "jotai";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BlurView } from "expo-blur";
import { usePathname } from "expo-router";

const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export default function MyTabBar({ state, navigation }: BottomTabBarProps) {
  const { bottom } = useSafeAreaInsets();

  const buttonWidth = 65;
  const buttonHeight = 55;

  const animatedTranslateXValue = useRef(new Animated.Value(0)).current;

  const animatedOpacityValue = useRef(new Animated.Value(1)).current;

  const setHomeScreenParameters = useSetAtom(homeScreeenParametersAtom);

  // Hiding for comment section.
  const [hideTabBar, setHideTabBar] = useState(false);

  const { haveUnread } = useNotification();

  const pathname = usePathname();

  const isIOS = Platform.OS === "ios";

  useEffect(() => {
    Animated.spring(animatedTranslateXValue, {
      toValue: buttonWidth * state.index,
      useNativeDriver: true,
    }).start();
  }, [state]);

  useEffect(() => {
    const subScreens = pathname.split("/");

    const currentScreen = subScreens[subScreens.length - 1];

    if (currentScreen !== "comments") {
      setHideTabBar(false);
    }

    Animated.timing(animatedOpacityValue, {
      toValue:
        currentScreen === "comments" ? 0 : subScreens.length > 3 ? 0.5 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start();

    if (currentScreen === "comments") {
      delay(500).then(() => {
        setHideTabBar(true);
      });
    }
  }, [pathname]);

  return (
    <Animated.View
      style={{
        display: hideTabBar ? "none" : undefined,
        alignSelf: "center",
        bottom: bottom || 20,
        position: "absolute",
        borderRadius: 35,
        overflow: "hidden",
        opacity: animatedOpacityValue,
      }}
    >
      <BlurView
        tint="dark"
        intensity={75}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: isIOS ? undefined : "black",
        }}
      >
        <Animated.View
          style={{
            position: "absolute",
            width: buttonWidth,
            height: buttonHeight,
            transform: [{ translateX: animatedTranslateXValue }],
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              height: "100%",
              width: "100%",
              borderRadius: 25,
            }}
          />
        </Animated.View>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }

            // Home Button Refreshing Logic
            if (route.name === "feed" && pathname === "/home/feed") {
              setHomeScreenParameters({
                isHomeButtonPressed: true,
              });
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <TabBarButton
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              isFocused={isFocused}
              routeName={route.name}
              color={isFocused ? "black" : "white"}
              buttonSize={24}
              haveUnReadNotifications={
                route.name === "notifications" ? haveUnread : undefined
              }
            />
          );
        })}
      </BlurView>
    </Animated.View>
  );
}
