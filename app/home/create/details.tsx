import {
  Animated,
  Dimensions,
  Keyboard,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";

import React, { useEffect, useRef, useState } from "react";
import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import { useAtomValue, useSetAtom } from "jotai";
import Text from "@/components/Text/Text";
import { Image } from "expo-image";

import auth from "@react-native-firebase/auth";
import appCheck from "@react-native-firebase/app-check";
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
  const animatedTranslateValue = useRef(new Animated.Value(0)).current;

  const [loading, setLoading] = useState(false);

  const setScreenParameters = useSetAtom(screenParametersAtom);

  const shareButtonOpacityValue = useRef(new Animated.Value(0.5)).current;

  // Keyboard-Layout Change
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      "keyboardWillShow",
      (event) => {
        if (Keyboard.isVisible()) return;

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

            Animated.timing(animatedTranslateValue, {
              toValue: -toValue,
              duration: 250,
              useNativeDriver: true,
            }).start();
          });
        }
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      "keyboardWillHide",
      (event) => {
        let toValue = 0;

        Animated.timing(animatedTranslateValue, {
          toValue: toValue,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [containerRef]);

  useEffect(() => {
    handleChangeOpactiy(shareButtonOpacityValue, loading ? 0.5 : 1, 250);
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
          description: description,
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
          value: `users/${currentUserAuthObject.displayName}/posts/${result.newPostDocId}`,
        },
      ]);

      router.push("/home/feed");

      setDescription("");

      setLoading(false);
    } catch (error) {
      console.error("Error on uploading post: ", error);
      crashlytics().recordError(new Error(`Error on uploading post: ${error}`));
      setLoading(false);
    }
  };

  const handleChangeOpactiy = (
    animatedObject: Animated.Value,
    toValue: number,
    duration: number
  ) => {
    Animated.timing(animatedObject, {
      toValue,
      duration,
      useNativeDriver: true,
    }).start();
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
            <Text
              style={{
                color: "black",
              }}
            >
              Share
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </ScrollView>
  );
};

export default details;
