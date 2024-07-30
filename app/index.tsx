import { useAuth } from "@/providers/AuthProvider";
import { Image } from "expo-image";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, SafeAreaView, View } from "react-native";

const index = () => {
  const { authStatus } = useAuth();

  const { width: screenWidth } = Dimensions.get("screen");

  const width = screenWidth / 4.16;

  const animatedOpacityValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    changeButtonOpacity(0);
  }, []);

  const changeButtonOpacity = (toValue: number) => {
    Animated.timing(animatedOpacityValue, {
      toValue: toValue,
      duration: 1 * 1000,
      useNativeDriver: true,
    }).start();
  };

  if (authStatus === "loading")
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            position: "relative",
            height: width,
            width: width,
          }}
        >
          <Animated.View
            style={{
              position: "absolute",
              opacity: animatedOpacityValue,
              width: width,
              height: width,
              backgroundColor: "black",
              zIndex: 1,
            }}
          />
          <Image
            source={require("@/assets/images/logo.png")}
            style={{
              width: width,
              height: width,
            }}
          />
        </View>
      </SafeAreaView>
    );
};

export default index;
