import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import { Text } from "@/components/Text/Text";
import apiRoutes from "@/helpers/ApiRoutes";
import { Feather } from "@expo/vector-icons";
import storage from "@react-native-firebase/storage";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useSetAtom } from "jotai";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Keyboard,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";

import createBlobFromURI from "@/utils/createBlobFromURI";
import auth from "@react-native-firebase/auth";

import appCheck from "@react-native-firebase/app-check";

import * as Progress from "react-native-progress";

const postCreate = () => {
  const [pickedImageURI, setPickedImageURI] = useState("");

  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [imageUploadPercentage, setImageUploadPercentage] = useState(0);

  const [tempImageLocation, setTempImageLocation] = useState("");

  const [description, setDescription] = useState("");

  const containerRef = useRef<null | View>(null);
  const screenHeight = Dimensions.get("window").height;
  const animatedTranslateValue = useRef(new Animated.Value(0)).current;

  const animatedOpacityValue = useRef(new Animated.Value(0.5)).current;

  const [canPost, setCanPost] = useState(false);

  const [loading, setLoading] = useState(false);

  const setScreenParameters = useSetAtom(screenParametersAtom);

  const handlePickImage = async () => {
    resetImageVariables();

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.2,
    });

    if (!result.canceled) {
      const pickedImage = result.assets[0];

      setPickedImageURI(pickedImage.uri);

      uploadImage(pickedImage.uri);
    }
  };

  const handleRemoveImageButton = () => {
    setPickedImageURI("");
    setImageUploadLoading(false);
    setImageUploadPercentage(0);
    setTempImageLocation("");
  };

  const uploadImage = async (image: string) => {
    const displayName = auth().currentUser?.displayName;
    if (!displayName) {
      console.error("Display name not found");
      return false;
    }

    setImageUploadLoading(true);

    try {
      const blob = await createBlobFromURI(image);

      const extension = image.split(".").pop() || ".jpg";
      const tempLocation = `users/${displayName}/postFiles/temp/${Date.now()}.${extension}`;

      const uploadTask = storage().ref(tempLocation).put(blob);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadPercentage(progress);
        },
        (error) => {
          console.error("Error on uploading image: ", error);
          resetImageVariables();
          return false;
        },
        () => {
          setImageUploadLoading(false);
          setTempImageLocation(tempLocation);
          return true;
        }
      );
    } catch (error) {
      console.error("Error on updating profile image: ", error);
      resetImageVariables();
      return false;
    }
  };

  const resetImageVariables = () => {
    setPickedImageURI("");
    setImageUploadLoading(false);
    setImageUploadPercentage(0);
    setTempImageLocation("");
  };

  const onDescriptionChange = (input: string) => {
    setDescription(input);
  };

  const handlePostButton = async () => {
    if ((!tempImageLocation && !description) || loading || imageUploadLoading) {
      setCanPost(false);
      return false;
    }

    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return false;

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
          tempImageLocation: tempImageLocation,
        }),
      });

      if (!response.ok) {
        console.error(
          "Response from postUpload API is not okay: ",
          await response.text()
        );
        setLoading(false);
        return false;
      }

      // Good to Go

      console.log("Post Uploaded successfully");
      const result = await response.json();

      setScreenParameters([
        {
          queryId: "createdPostDocPath",
          value: `users/${currentUserAuthObject.displayName}/posts/${result.newPostDocId}`,
        },
      ]);

      router.push("/home");

      resetImageVariables();
      setDescription("");

      setLoading(false);

      return true;
    } catch (error) {
      console.error("Error on uploading post: ", error);
      setLoading(false);
      return false;
    }
  };

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

  // Input Validation
  useEffect(() => {
    if ((!tempImageLocation && !description) || loading || imageUploadLoading) {
      return setCanPost(false);
    }

    setCanPost(true);
  }, [tempImageLocation, description, loading, imageUploadLoading]);

  // Input Validation
  useEffect(() => {
    if (canPost) {
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
  }, [canPost]);

  return (
    <ScrollView
      style={{
        flex: 1,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <Animated.View
        ref={containerRef}
        style={{
          width: "100%",
          alignItems: "center",
          gap: 10,
          transform: [
            {
              translateY: animatedTranslateValue,
            },
          ],
        }}
      >
        <View
          id="image-upload-area"
          style={{
            width: "100%",
            padding: 10,
            gap: 5,
          }}
        >
          <Text
            bold
            style={{
              fontSize: 20,
            }}
          >
            Image
          </Text>
          {pickedImageURI ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                position: "relative",
              }}
            >
              {imageUploadLoading && (
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: 350,
                    zIndex: 1,
                    backgroundColor: "rgba(0,0,0,0.5)",
                  }}
                >
                  <Progress.Circle
                    borderWidth={
                      imageUploadPercentage < 10 || imageUploadPercentage > 95
                        ? 5
                        : undefined
                    }
                    size={120}
                    thickness={5}
                    progress={imageUploadPercentage / 100}
                    indeterminate={
                      imageUploadPercentage < 10 || imageUploadPercentage > 95
                    }
                  />
                </View>
              )}

              <Image
                source={pickedImageURI}
                style={{
                  width: "100%",
                  height: 350,
                  borderRadius: 10,
                }}
                transition={500}
              />
              <Pressable
                onPress={handleRemoveImageButton}
                style={{
                  borderWidth: 1,
                  borderColor: "gray",
                  padding: 10,
                  borderRadius: 20,
                }}
              >
                <Text>Remove Image</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={handlePickImage}>
              <View
                id="image-placeholder"
                style={{
                  width: "100%",
                  height: 350,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Feather name="upload" size={40} color="white" />
              </View>
            </Pressable>
          )}
        </View>
        <View
          id="description-area"
          style={{
            width: "100%",
            padding: 10,
            gap: 5,
          }}
        >
          <Text
            bold
            style={{
              fontSize: 20,
            }}
          >
            Description
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "gray",
              padding: 10,
              borderRadius: 10,
              color: "white",
            }}
            onChangeText={onDescriptionChange}
            value={description}
          />
        </View>
        <Animated.View
          id="button"
          style={{
            opacity: animatedOpacityValue,
          }}
        >
          <Pressable
            onPress={handlePostButton}
            disabled={!canPost}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "white",
            }}
          >
            {loading ? <ActivityIndicator /> : <Text bold>Post</Text>}
          </Pressable>
        </Animated.View>
      </Animated.View>
    </ScrollView>
  );
};

export default postCreate;
