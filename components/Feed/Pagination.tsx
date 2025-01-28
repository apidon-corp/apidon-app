import {
  View,
  Animated,
  Pressable,
  Text as NativeText,
  ViewProps,
  ViewStyle,
} from "react-native";
import React, { useEffect, useRef } from "react";
import Text from "../Text/Text";

const buttonWidth = 95;
const buttonHeight = 25;
const borderRadius = 25;
const fontSize = 13;

type Props = {
  panelName: string;
  setPanelName: React.Dispatch<React.SetStateAction<"colls" | "posts">>;
  style?: ViewStyle;
};

const Pagination = ({ panelName, setPanelName, style }: Props) => {
  const animatedTranslateXValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animatedTranslateXValue, {
      toValue: buttonWidth * (panelName === "colls" ? 0 : 1),
      useNativeDriver: true,
    }).start();
  }, [panelName]);

  return (
    <View
      id="root-pagination"
      style={[
        {
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
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
            setPanelName("colls");
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
            style={{ color: panelName === "colls" ? "black" : "white" }}
          >
            Colls
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setPanelName("posts");
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
            style={{ color: panelName === "posts" ? "black" : "white" }}
          >
            Posts
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default Pagination;
