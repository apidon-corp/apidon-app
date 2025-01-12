import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";

import Animated, { useSharedValue, withTiming } from "react-native-reanimated";

import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import Text from "@/components/Text/Text";
import { Image } from "expo-image";
import { useAtomValue, useSetAtom } from "jotai";
import React, { useEffect, useRef, useState } from "react";

import appCheck from "@react-native-firebase/app-check";
import auth from "@react-native-firebase/auth";
import crashlytics from "@react-native-firebase/crashlytics";

import apiRoutes from "@/helpers/ApiRoutes";
import { router } from "expo-router";

const CHARACTER_LIMIT = 125;

const details = () => {
  const parameters = useAtomValue(screenParametersAtom);

  const pickedImageURI =
    parameters.find((p) => p.queryId === "pickedImageURI")?.value || "";
  const uploadedImageLocation =
    parameters.find((p) => p.queryId === "uploadedImageLocation")?.value || "";

  const [description, setDescription] = useState("");

  const containerRef = useRef<null | View>(null);
  const screenHeight = Dimensions.get("window").height;
  const animatedTranslateValue = useSharedValue(0);

  const [loading, setLoading] = useState(false);

  const setScreenParameters = useSetAtom(screenParametersAtom);

  const shareButtonOpacityValue = useSharedValue(0.5);

  // Keyboard-Layout Change
  useEffect(() => {
    const isIOS = Platform.OS === "ios";

    const keyboardWillShowListener = Keyboard.addListener(
      isIOS ? "keyboardWillShow" : "keyboardDidShow",
      (event) => {
        if (isIOS && Keyboard.isVisible()) return;

        const keyboardHeight = event.endCoordinates.height;

        if (containerRef.current) {
          containerRef.current.measure((x, y, width, height, pageX, pageY) => {
            const containerBottom = pageY + height;
            const distanceFromBottom = screenHeight - containerBottom;

            let toValue = 0;
            if (distanceFromBottom > keyboardHeight) {
              toValue = 0;
            } else {
              toValue = keyboardHeight - distanceFromBottom;
              toValue += 40;
            }

            animatedTranslateValue.value = withTiming(-toValue, {
              duration: 250,
            });
          });
        }
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      isIOS ? "keyboardWillHide" : "keyboardDidHide",
      (event) => {
        animatedTranslateValue.value = withTiming(0, {
          duration: 250,
        });
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [containerRef]);

  useEffect(() => {
    handleChangeOpactiy(loading ? 0.5 : 1);
  }, [loading]);

  const handleDescriptionChange = (text: string) => {
    setDescription(text.slice(0, CHARACTER_LIMIT));
  };

  const handleShareButton = async () => {
    if (!pickedImageURI || !uploadedImageLocation) return;
    if (description.length > CHARACTER_LIMIT) return;
    if (loading) return;

    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return;

    setLoading(true);

    try {
      const idToken = await currentUserAuthObject.getIdToken();
      const { token: appchecktoken } = await appCheck().getLimitedUseToken();

      const response = await fetch(apiRoutes.post.postUpload, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
          appchecktoken,
        },
        body: JSON.stringify({
          description: description.trim(),
          tempImageLocation: uploadedImageLocation,
        }),
      });

      if (!response.ok) {
        console.error(
          "Response from postUpload API is not okay: ",
          await response.text()
        );
        return setLoading(false);
      }

      const result = await response.json();

      setScreenParameters([
        {
          queryId: "createdPostDocPath",
          value: `posts/${result.newPostDocId}`,
        },
      ]);

      if (router.canGoBack()) router.back();

      router.push("/home/feed");

      setDescription("");

      setLoading(false);
    } catch (error) {
      console.error("Error on uploading post: ", error);
      crashlytics().recordError(new Error(`Error on uploading post: ${error}`));
      setLoading(false);
    }
  };

  const handleChangeOpactiy = (toValue: number) => {
    shareButtonOpacityValue.value = withTiming(toValue, {
      duration: 250,
    });
  };

  if (!pickedImageURI || !uploadedImageLocation)
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          padding: 15,
          justifyContent: "center",
          alignItems: "center",
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text>Please try uploading image again on previous screen.</Text>
      </ScrollView>
    );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        padding: 15,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        ref={containerRef}
        id="root-view-for-layout-change"
        style={{
          gap: 15,
          transform: [
            {
              translateY: animatedTranslateValue,
            },
          ],
        }}
      >
        <View
          id="image-preview-area"
          style={{
            width: "100%",
            alignItems: "center",
          }}
        >
          <Image
            source={pickedImageURI}
            style={{
              width: "75%",
              aspectRatio: 1,
              borderRadius: 20,
            }}
          />
        </View>

        <View
          id="description"
          style={{
            width: "100%",
            gap: 5,
          }}
        >
          <TextInput
            value={description}
            onChangeText={handleDescriptionChange}
            multiline={true}
            placeholder="Write a caption..."
            placeholderTextColor="gray"
            style={{
              width: "100%",
              height: 80,
              color: "white",
              backgroundColor: "rgba(255,255,255,0.07)",
              borderRadius: 10,
              padding: 10,
            }}
          />
          <View
            id="character-limit"
            style={{
              width: "100%",
              alignItems: "flex-end",
            }}
          >
            <Text
              fontSize={12}
              style={{
                color: "gray",
              }}
            >
              {description.length}/125
            </Text>
          </View>
        </View>

        <Animated.View
          id="share"
          style={{
            opacity: shareButtonOpacityValue,
            width: "100%",
            alignItems: "center",
          }}
        >
          <Pressable
            onPress={handleShareButton}
            disabled={loading}
            style={{
              padding: 10,
              paddingHorizontal: 20,
              backgroundColor: "white",
              borderRadius: 10,
            }}
          >
            {loading ? (
              <ActivityIndicator color="black" size={14} />
            ) : (
              <Text
                style={{
                  color: "black",
                }}
              >
                Share
              </Text>
            )}
          </Pressable>
        </Animated.View>
      </Animated.View>
    </ScrollView>
  );
};

export default details;
