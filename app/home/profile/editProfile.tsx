import { Text } from "@/components/Text/Text";
import { apidonPink } from "@/constants/Colors";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Keyboard,
  Pressable,
  SafeAreaView,
  ScrollView,
  TextInput,
  View,
} from "react-native";

import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import storage from "@react-native-firebase/storage";
import * as ImagePicker from "expo-image-picker";

import apiRoutes from "@/helpers/ApiRoutes";
import { Image } from "expo-image";
import { useAtomValue } from "jotai";

import createBlobFromURI from "@/utils/createBlobFromURI";
import auth from "@react-native-firebase/auth";

import appCheck from "@react-native-firebase/app-check";

const editProfile = () => {
  const screenParameters = useAtomValue(screenParametersAtom);

  const fullname = screenParameters.find((p) => p.queryId === "fullname")
    ?.value as string;

  const image = screenParameters.find((p) => p.queryId === "image")
    ?.value as string;

  const [error, setError] = useState("");

  const [fullnameEdited, setFullnameEdited] = useState(fullname);
  const [isFullnameValid, setIsFullnameValid] = useState(true);
  const [isFullnameChanged, setIsFullnameChanged] = useState(false);

  const [imageEdited, setImageEdited] = useState("");

  const containerRef = useRef<null | View>(null);
  const screenHeight = Dimensions.get("window").height;
  const animatedTranslateValue = useRef(new Animated.Value(0)).current;

  const animatedOpacityValue = useRef(new Animated.Value(0.5)).current;

  const [loading, setLoading] = useState(false);

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
    const editStatus = isFullnameChanged || imageEdited.length > 0;
    const forwardStatus = isFullnameValid && editStatus;

    if (forwardStatus) {
      Animated.timing(animatedOpacityValue, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animatedOpacityValue, {
        toValue: 0.5,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [isFullnameValid, isFullnameChanged, imageEdited]);

  useEffect(() => {
    setIsFullnameChanged(fullnameEdited !== fullname);
  }, [fullnameEdited, fullname]);

  const handleFullnameChange = (input: string) => {
    setError("");
    input = input.replace(/[^\p{L}\p{N}\s]/gu, "");
    setFullnameEdited(input);

    const fullnameRegex = /^\p{L}{1,20}(?: \p{L}{1,20})*$/u;
    const regexTestResult = fullnameRegex.test(input);

    setIsFullnameValid(regexTestResult);

    // Explain Error
    if (!regexTestResult && input.length > 0)
      setError(
        "Please enter your full name consisting of 3 to 20 characters, using letters and spaces."
      );
  };

  const handleChangeImageButton = async () => {
    if (imageEdited.length > 0) return setImageEdited("");

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.2,
    });

    if (!result.canceled) {
      setImageEdited(result.assets[0].uri);
    }
  };

  const handleSaveButton = async () => {
    if (loading) return;
    setLoading(true);

    const [imageOperationResult, fullnameOperationResult] = await Promise.all([
      imageOperationsExecutor(),
      fullnameOperationsExecutor(),
    ]);

    if (!imageOperationResult || !fullnameOperationResult) {
      console.error("Image or fullname operation failed.");
      return setLoading(false);
    }

    router.back();

    setLoading(false);
  };

  const uploadImage = async (image: string) => {
    const displayName = auth().currentUser?.displayName;
    if (!displayName) {
      console.error("Display name not found");
      return false;
    }

    try {
      const blob = await createBlobFromURI(image);

      const path = `users/${displayName}/profilePhoto`;

      await storage().ref(path).put(blob);

      const downloadURL = await storage().ref(path).getDownloadURL();

      return downloadURL;
    } catch (error) {
      console.error("Error on uploading profile image: ", error);
      return false;
    }
  };

  const updateImage = async (imageURL: string) => {
    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return false;

    try {
      const idToken = await currentUserAuthObject.getIdToken();

      const { token: appchecktoken } = await appCheck().getLimitedUseToken();

      const response = await fetch(apiRoutes.user.personal.updateProfileImage, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
          appchecktoken,
        },
        body: JSON.stringify({
          image: imageURL,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        console.error(
          "Response from updateProfileImage API is not okay: ",
          message
        );
        setError(message);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error on updating profile image: ", error);
      setError("Internal Server Error");
      return false;
    }
  };

  const imageOperationsExecutor = async () => {
    if (imageEdited.length === 0) return true;

    const imageUrl = await uploadImage(imageEdited);
    if (!imageUrl) return false;

    const updateImageResult = await updateImage(imageUrl);
    if (!updateImageResult) return false;

    return true;
  };

  const updateFullname = async (fullname: string) => {
    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return false;

    try {
      const idToken = await currentUserAuthObject.getIdToken();

      const { token: appchecktoken } = await appCheck().getLimitedUseToken();

      const response = await fetch(apiRoutes.user.personal.fullnameUpdate, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
          appchecktoken,
        },
        body: JSON.stringify({
          fullname: fullname,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        console.error(
          "Response from updateFullname API is not okay: ",
          message
        );
        setError(message);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error on updating fullname: ", error);
      setError("Internal Server Error");
      return false;
    }
  };

  const fullnameOperationsExecutor = async () => {
    if (!isFullnameChanged) return true;
    if (!isFullnameValid) return false;

    const updateFullnameResult = await updateFullname(fullnameEdited);
    return updateFullnameResult;
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flex: 1,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          ref={containerRef}
          style={{
            marginTop: 20,
            alignItems: "center",
            padding: 15,
            gap: 20,
            transform: [
              {
                translateY: animatedTranslateValue,
              },
            ],
          }}
        >
          <View
            style={{
              gap: 5,
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={imageEdited || image || require("@/assets/images/user.jpg")}
              style={{
                width: 200,
                aspectRatio: 1,
                borderRadius: 100,
              }}
              transition={500}
            />

            <Pressable
              onPress={handleChangeImageButton}
              style={{
                borderColor: apidonPink,
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 10,
                paddingVertical: 5,
                marginTop: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  textAlign: "center",
                }}
                bold
              >
                {imageEdited ? "Cancel" : "Change Image"}
              </Text>
            </Pressable>
          </View>
          <View
            style={{
              width: "100%",
              gap: 5,
            }}
          >
            <Text
              bold
              style={{
                fontSize: 16,
              }}
            >
              Fullname
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor:
                  isFullnameValid || fullnameEdited?.length === 0
                    ? "gray"
                    : "red",
                padding: 10,
                color: "white",
                borderRadius: 10,
              }}
              value={fullnameEdited}
              onChangeText={handleFullnameChange}
            />
            {error && (
              <Text
                style={{
                  fontSize: 14,
                  color: "red",
                  textAlign: "center",
                }}
              >
                {error}
              </Text>
            )}
          </View>

          <Animated.View
            style={{
              opacity: animatedOpacityValue,
              width: "100%",
              alignItems: "center",
            }}
          >
            <Pressable
              onPress={handleSaveButton}
              style={{
                padding: 10,
                backgroundColor: apidonPink,
                borderRadius: 10,
                width: "30%",
              }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  style={{
                    color: "white",
                    fontSize: 14,
                    textAlign: "center",
                  }}
                >
                  Save
                </Text>
              )}
            </Pressable>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default editProfile;
