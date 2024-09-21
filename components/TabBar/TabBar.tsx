import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import TabBarButton from "./TabBarButton";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSetAtom } from "jotai";
import { homeScreeenParametersAtom } from "@/atoms/homeScreenAtom";

export default function MyTabBar({ state, navigation }: BottomTabBarProps) {
  const { bottom } = useSafeAreaInsets();

  const buttonWidth = 65;
  const buttonHeight = 55;

  const animatedTranslateXValue = useRef(new Animated.Value(0)).current;

  const setHomeScreenParameters = useSetAtom(homeScreeenParametersAtom);

  useEffect(() => {
    Animated.spring(animatedTranslateXValue, {
      toValue: buttonWidth * state.index,
      useNativeDriver: true,
    }).start();
  }, [state]);

  return (
    <View
      style={{
        alignSelf: "center",

        bottom: bottom || 20,

        position: "absolute",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        backgroundColor: "#343434",
        borderRadius: 35,
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
          if (route.name === "feed" && isFocused) {
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
          />
        );
      })}
    </View>
  );
}
