import { View, Animated, Pressable, Text as NativeText } from "react-native";
import React, { useEffect, useRef } from "react";
import Text from "../Text/Text";

const buttonWidth = 95;
const buttonHeight = 25;
const borderRadius = 25;
const fontSize = 13;

type Props = {
  panelName: string;
  setPanelName: React.Dispatch<React.SetStateAction<"all" | "following">>;
};

const Pagination = ({ panelName, setPanelName }: Props) => {
  const animatedTranslateXValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animatedTranslateXValue, {
      toValue: buttonWidth * (panelName === "all" ? 0 : 1),
      useNativeDriver: true,
    }).start();
  }, [panelName]);

  return (
    <>
      <Pressable
        style={{
          width: buttonWidth,
          height: buttonHeight,
          borderRadius: borderRadius,
          justifyContent: "center",
          alignItems: "center",
          borderWidth : 1,
          borderColor: "red"
        }}
      >
        <NativeText style={{color: "white"}}>Hello</NativeText>
      </Pressable>

      <View
        id="root-pagination"
        style={{
          flex: 1,
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          marginVertical: 5,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            borderRadius: borderRadius,
            borderWidth: 1,
            borderColor: "gray",
          }}
        >
          <Animated.View
            id="moving-dot"
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
                borderRadius: borderRadius,
              }}
            />
          </Animated.View>
          <Pressable
            onPress={() => {
              setPanelName("all");
            }}
            style={{
              width: buttonWidth,
              height: buttonHeight,
              borderRadius: borderRadius,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              fontSize={fontSize}
              bold
              style={{ color: panelName === "all" ? "black" : "white" }}
            >
              All
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setPanelName("following");
            }}
            style={{
              width: buttonWidth,
              height: buttonHeight,
              borderRadius: borderRadius,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              fontSize={fontSize}
              bold
              style={{ color: panelName === "following" ? "black" : "white" }}
            >
              Following
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );
};

export default Pagination;
