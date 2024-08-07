import { View, Text, Dimensions } from "react-native";
import React from "react";

import { Image } from "expo-image";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  clamp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = {
  source: string;
};

const PostImage = ({ source }: Props) => {
  const scale = useSharedValue(1);
  const startScale = useSharedValue(0);

  const { width, height } = Dimensions.get("screen");

  const pinch = Gesture.Pinch()
    .onStart(() => {
      startScale.value = scale.value;
    })
    .onUpdate((event) => {
      scale.value = clamp(
        startScale.value * event.scale,
        0.5,
        Math.min(width / 100, height / 100)
      );
    })
    .onFinalize(() => {
      scale.value = withTiming(1, {
        duration: 250,
      });
    })
    .runOnJS(true);

  const imageAnimatedStyles = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    zIndex: 1,
  }));

  return (
    <GestureDetector gesture={pinch}>
      <Animated.View style={imageAnimatedStyles}>
        <Image
          source={source}
          style={{
            width: "100%",
            aspectRatio: 1,
          }}
          transition={500}
        />
      </Animated.View>
    </GestureDetector>
  );
};

export default PostImage;
