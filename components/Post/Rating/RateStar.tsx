import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import CurvedStars from "./CurvedStars";

import apiRoutes from "@/helpers/ApiRoutes";

import auth from "@react-native-firebase/auth";

import Text from "@/components/Text/Text";
import appCheck from "@react-native-firebase/app-check";
import { apidonPink } from "@/constants/Colors";

type Props = {
  previousValue: number | undefined;
  postDocPath: string;
};

type Location = {
  x: number;
  y: number;
};

const RateStar = ({ previousValue, postDocPath }: Props) => {
  const [isRatingPanelVisible, setIsRatingPanelVisible] = useState(false);

  const [rateValue, setRateValue] = useState<undefined | number>(previousValue);

  const [loading, setLoading] = useState(false);

  const { width: screenWidth } = Dimensions.get("screen");

  const [showArrow, setShowArrow] = useState(false);

  const adjustedScreenWidth = screenWidth * 0.5 * 0.5;
  const verticalPadding = -20;

  const locations: {
    starIndex: number;
    location: Location;
  }[] = [
    {
      starIndex: 0,
      location: { x: -adjustedScreenWidth, y: 0 + verticalPadding },
    },
    {
      starIndex: 1,
      location: {
        x: -adjustedScreenWidth * 0.71,
        y: -adjustedScreenWidth * 0.71 + verticalPadding,
      },
    },
    {
      starIndex: 2,
      location: { x: 0, y: -adjustedScreenWidth + verticalPadding },
    },
    {
      starIndex: 3,
      location: {
        x: adjustedScreenWidth * 0.71,
        y: -adjustedScreenWidth * 0.71 + verticalPadding,
      },
    },
    {
      starIndex: 4,
      location: { x: adjustedScreenWidth, y: 0 + verticalPadding },
    },
  ];

  useEffect(() => {
    if (!isRatingPanelVisible) {
      if (rateValue !== previousValue) {
        handleUpdateRate();
      }
    }
  }, [isRatingPanelVisible]);

  const handleUpdateRate = async () => {
    if (loading) return;

    if (rateValue === undefined)
      return console.error("Rate value is undefined");

    setLoading(true);

    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return console.error("User is not logged");

    try {
      const idToken = await currentUserAuthObject.getIdToken();

      const { token: appchecktoken } = await appCheck().getLimitedUseToken();
      const response = await fetch(apiRoutes.post.rate.postRate, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
          appchecktoken,
        },
        body: JSON.stringify({
          rating: rateValue,
          postDocPath: postDocPath,
        }),
      });

      if (!response.ok) {
        setLoading(false);
        return console.error(
          "Response from postRate API is not okay:  ",
          await response.text()
        );
      }
      setLoading(false);
      // Good to Go
    } catch (error) {
      setLoading(false);
      return console.error("Error on updating rate: ", error);
    }
  };

  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const prevTranslationX = useSharedValue(0);
  const prevTranslationY = useSharedValue(0);

  const scale = useSharedValue(1);

  const animatedPanStyle = useAnimatedStyle(() => ({
    zIndex: 1,
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
      {
        scale: scale.value,
      },
    ],
  }));

  function calculateHoveredStarIndex(x: number, y: number) {
    const thresholdX = 20;
    const thresholdY = 20;
    return (
      locations.find(
        (loc) =>
          Math.abs(loc.location.x - x) <= thresholdX &&
          Math.abs(loc.location.y - y - 40) <= thresholdY
      )?.starIndex ?? -1
    );
  }

  function rateValueUpdate(x: number, y: number) {
    const hoveredStarIndex = calculateHoveredStarIndex(x, y);
    if (hoveredStarIndex === -1) return;

    setRateValue(hoveredStarIndex + 1);
  }

  const pan = Gesture.Pan()
    .minDistance(1)
    .onBegin(() => {
      scale.value = withTiming(1.5, {
        duration: 100,
      });
      setShowArrow(true);
    })
    .onStart(() => {
      prevTranslationX.value = 0;
      prevTranslationY.value = 0;
      setIsRatingPanelVisible(true);
      setShowArrow(false);
    })
    .onUpdate((event) => {
      translationX.value = prevTranslationX.value + event.translationX;
      translationY.value = prevTranslationY.value + event.translationY;

      rateValueUpdate(
        prevTranslationX.value + event.translationX,
        prevTranslationY.value + event.translationY
      );

      setShowArrow(false);
    })
    .onEnd(() => {
      translationX.value = 0;
      translationY.value = 0;
      setIsRatingPanelVisible(false);
      setShowArrow(false);
    })
    .onFinalize(() => {
      scale.value = withTiming(1, {
        duration: 250,
      });
      setShowArrow(false);
    })
    .runOnJS(true);

  return (
    <>
      {loading ? (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator color="gray" />
        </View>
      ) : (
        <GestureDetector gesture={pan}>
          <Animated.View style={animatedPanStyle}>
            <View
              style={{
                position: "relative",
              }}
            >
              <MaterialCommunityIcons
                name="star-plus"
                size={45}
                color="white"
              />
              <View
                style={{
                  position: "absolute",
                  bottom: 2,
                  right: 2,
                  backgroundColor: apidonPink,
                  borderRadius: 25,
                  width: 18,
                  aspectRatio: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  display: previousValue ? "flex" : "none",
                }}
              >
                <Text bold fontSize={12} style={{ color: "white" }}>
                  {previousValue}
                </Text>
              </View>
            </View>
          </Animated.View>
        </GestureDetector>
      )}

      <View
        style={{
          display: showArrow ? undefined : "none",

          position: "absolute",
          bottom: 75,

          width: Dimensions.get("screen").width,
          aspectRatio: 1,

          alignItems: "center",
          justifyContent: "flex-end",

          paddingBottom: 10,

          backgroundColor: "rgba(0,0,0,0.75)",
        }}
      >
        <FontAwesome name="long-arrow-up" size={144} color="white" />
      </View>

      <View
        style={{
          display: isRatingPanelVisible ? undefined : "none",

          position: "absolute",
          bottom: 75,

          width: Dimensions.get("screen").width,
          aspectRatio: 1,

          alignItems: "center",
          justifyContent: "flex-end",

          backgroundColor: "rgba(0,0,0,0.85)",
        }}
      >
        <CurvedStars
          rateValue={rateValue ? rateValue : 0}
          locations={locations}
        />
      </View>
    </>
  );
};

export default RateStar;
