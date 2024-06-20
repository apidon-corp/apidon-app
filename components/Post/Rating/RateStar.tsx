import { apidonPink } from "@/constants/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Dimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import CurvedStarRating from "./CurvedStars";
import CurvedStars from "./CurvedStars";

type Props = {};

const RateStar = (props: Props) => {
  const [longPressed, setLongPressed] = useState(false);

  const { height, width } = Dimensions.get("screen");

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const longPress = Gesture.LongPress()
    .minDuration(500)
    .onBegin(() => {
      console.log("Press started");
      scale.value = withTiming(1.5, { duration: 500 });
    })
    .onStart(() => {
      console.log("Press Recognized");
      runOnJS(setLongPressed)(true);
    })
    .onFinalize(() => {
      console.log("Press ended");
    });

  return (
    <>
      <GestureDetector gesture={longPress}>
        <Animated.View style={animatedStyle}>
          <MaterialCommunityIcons
            name="star-plus"
            size={40}
            color={longPressed ? apidonPink : "white"}
          />
        </Animated.View>
      </GestureDetector>

      <View
        style={{
          position: "absolute",
          width: width,
          height: height,
          backgroundColor: "rgba(0,0,0,0.9)",
          display: longPressed ? "flex" : "none",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CurvedStars />
      </View>
    </>
  );
};

export default RateStar;
