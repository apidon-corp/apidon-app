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
import CurvedStars from "./CurvedStars";

type Props = {};

const RateStar = (props: Props) => {
  const [isRatingPanelVisible, setIsRatingPanelVisible] = useState(false);

  const [rateValue, setRateValue] = useState(0);

  /**
   * For the first star:
   *  x (-) = 145 and 95
   *  y = 40 and 80
   */

  /**
   * x (-) = 90 and 40
   * y (-) = 125 and 75
   */

  /**
   * x = -30 and +30
   * y (-) = 110 and 160
   */

  /**
   * +40 and +90 (x)
   * 75 and 125 (y) (-)
   */

  /**
   * 95 and 145 (x) (+)
   * 40 and 80 (y) (-)
   */

  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const prevTranslationX = useSharedValue(0);
  const prevTranslationY = useSharedValue(0);

  const scale = useSharedValue(1);

  const animatedPanStyle = useAnimatedStyle(() => ({
    zIndex: 5,
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
      {
        scale: scale.value,
      },
    ],
  }));

  function calculateHoveredStarIndex(x: number, y: number) {
    if (x >= -145 && x <= -95 && y >= -80 && y <= -40) {
      return 0;
    }
    if (x >= -90 && x <= -40 && y >= -125 && y <= -75) {
      return 1;
    }
    if (x >= -30 && x <= 30 && y >= -160 && y <= -110) {
      return 2;
    }
    if (x >= 40 && x <= 90 && y >= -125 && y <= -75) {
      return 3;
    }
    if (x >= 95 && x <= 145 && y >= -80 && y <= -40) {
      return 4;
    }
    return -1;
  }

  function rateValueUpdate(x: number, y: number) {
    const hoveredStarIndex = calculateHoveredStarIndex(x, y);
    if (hoveredStarIndex === -1) return;

    setRateValue(hoveredStarIndex + 1);
  }

  const pan = Gesture.Pan()
    .minDistance(1)
    .onBegin(() => {})
    .onStart(() => {
      prevTranslationX.value = 0;
      prevTranslationY.value = 0;
      runOnJS(setIsRatingPanelVisible)(true);

      scale.value = withTiming(1.5, {
        duration: 250,
      });
    })
    .onUpdate((event) => {
      translationX.value = prevTranslationX.value + event.translationX;
      translationY.value = prevTranslationY.value + event.translationY;

      runOnJS(rateValueUpdate)(
        prevTranslationX.value + event.translationX,
        prevTranslationY.value + event.translationY
      );
    })
    .onEnd(() => {
      translationX.value = 0;
      translationY.value = 0;
      runOnJS(setIsRatingPanelVisible)(false);

      scale.value = withTiming(1, {
        duration: 250,
      });
    });

  return (
    <>
      <GestureDetector gesture={pan}>
        <Animated.View style={animatedPanStyle}>
          <MaterialCommunityIcons name="star-plus" size={40} color="white" />
        </Animated.View>
      </GestureDetector>

      <View
        style={{
          display: isRatingPanelVisible ? "flex" : "none",
          position: "absolute",
          bottom: 50,
          height: 425,
          width: Dimensions.get("screen").width,
          alignItems: "center",
          justifyContent: "flex-end",
          backgroundColor: "rgba(0,0,0,0.9)",
        }}
      >
        <CurvedStars rateValue={rateValue} setRateValue={setRateValue} />
      </View>
    </>
  );
};

export default RateStar;
