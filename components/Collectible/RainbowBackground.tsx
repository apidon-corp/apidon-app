import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { View, ViewStyle } from "react-native";

import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface AnimatedBlockProps {
  style?: ViewStyle;
  children?: React.ReactNode;
  thickness?: number;
  rotateSpeed?: number;
  rainbowBorderRadius?: number;
  rainbowOpacity?: number;
}

const RainbowAnimation: React.FC<AnimatedBlockProps> = ({
  style,
  children,
  thickness = 2,
  rotateSpeed = 1,
  rainbowBorderRadius = 20,
  rainbowOpacity = 1,
}) => {
  const translateX = useSharedValue(0);

  const [componentWidth, setComponentWidth] = React.useState(0);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(1, { duration: 10000 / rotateSpeed }),
      -1,
      true
    );

    return () => {
      translateX.value = 0;
    };
  }, []);

  const gradientColors = [
    "#fb0094",
    "#0000ff",
    "#00ff00",
    "#ffff00",
    "#ff0000",
    "#fb0094",
    "#0000ff",
    "#00ff00",
    "#ffff00",
    "#ff0000",
  ];

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            translateX.value,
            [0, 1],
            [0, -componentWidth]
          ),
        },
      ],
    };
  }, [componentWidth]);

  return (
    <View
      style={style}
      onLayout={(event) => setComponentWidth(event.nativeEvent.layout.width)}
    >
      <View
        id="wrapper"
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          padding: thickness,
          borderRadius: rainbowBorderRadius,
        }}
      >
        <Animated.View
          style={[
            {
              position: "absolute",
              left: -2,
              top: -2,
              right: -2,
              bottom: -2,
              borderRadius: 2,
            },
            ,
            animatedStyle,
          ]}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              flex: 1,
              width: "400%",
              opacity: rainbowOpacity,
            }}
          />
        </Animated.View>

        {children}
      </View>
    </View>
  );
};

export default RainbowAnimation;
