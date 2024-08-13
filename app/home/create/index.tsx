import Text from "@/components/Text/Text";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, Pressable, ScrollView, View } from "react-native";

import createBlobFromURI from "@/utils/createBlobFromURI";
import auth from "@react-native-firebase/auth";
import storage from "@react-native-firebase/storage";

import * as ImagePicker from "expo-image-picker";

import crashlytics from "@react-native-firebase/crashlytics";

import { Image } from "expo-image";
import * as Progress from "react-native-progress";
import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import { useSetAtom } from "jotai";
import { router, usePathname } from "expo-router";

const index = () => {
  const [pickedImageURI, setPickedImageURI] = useState("");

  const [isImageUploading, setIsImageUploading] = useState(false);
  const [imageUploadPercentage, setImageUploadPercentage] = useState(0);

  const [uploadedImageLocation, setUploadedImageLocation] = useState("");

  const imagePreviewOpacityValue = useRef(new Animated.Value(0.5)).current;
  const removeImageButtonOpactiyValue = useRef(new Animated.Value(0)).current;
  const nextButtonOpacityValue = useRef(new Animated.Value(0.5)).current;

  const setScreenParameters = useSetAtom(screenParametersAtom);

  const pathname = usePathname();

  // Handle Opacities
  useEffect(() => {
    handleChangeOpactiy(
      imagePreviewOpacityValue,
      uploadedImageLocation ? 1 : 0.5,
      500
    );
    handleChangeOpactiy(
      removeImageButtonOpactiyValue,
      pickedImageURI ? 1 : 0,
      pickedImageURI ? 1000 : 250
    );
    handleChangeOpactiy(
      nextButtonOpacityValue,
      uploadedImageLocation ? 1 : 0.5,
      500
    );
  }, [uploadedImageLocation, pickedImageURI]);

  useEffect(() => {
    if (pathname === "/home/create" || pathname === "/home/create/details")
      return;

    setPickedImageURI("");
    setIsImageUploading(false);
    setImageUploadPercentage(0);
    setUploadedImageLocation("");
  }, [pathname]);

  const uploadImage = async (imageURI: string) => {
    const displayName = auth().currentUser?.displayName;
    if (!displayName) {
      console.error("Display name not found");
      return false;
    }

    setIsImageUploading(true);

    try {
      const blob = await createBlobFromURI(imageURI);

      const extension = imageURI.split(".").pop() || ".jpg";
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
          setPickedImageURI("");
          setIsImageUploading(false);
          setImageUploadPercentage(0);
          setUploadedImageLocation("");

          Alert.alert(
            "Error",
            "Error on uploading image. Please try again later."
          );
          crashlytics().recordError(
            new Error(
              `Error on uploading image on creating post (upload error): ${error}`
            )
          );
          console.error("Error on uploading image: ", error);
        },
        () => {
          setIsImageUploading(false);
          setImageUploadPercentage(0);
          setUploadedImageLocation(tempLocation);
        }
      );
    } catch (error) {
      setPickedImageURI("");
      setIsImageUploading(false);
      setImageUploadPercentage(0);
      setUploadedImageLocation("");

      Alert.alert("Error", "Error on uploading image.");
      crashlytics().recordError(
        new Error(
          `Error on uploading image on creating post: (exception): ${error}`
        )
      );
      console.error(
        "Error on uploading image on creating post: (exception):  ",
        error
      );
    }
  };

  const handlePickImage = async () => {
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

  const handleRemoveImage = () => {
    setPickedImageURI("");
    setImageUploadPercentage(0);
    setIsImageUploading(false);
    setUploadedImageLocation("");
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

  const handleNextButton = () => {
    if (!pickedImageURI || !uploadedImageLocation) return;

    setScreenParameters([
      { queryId: "pickedImageURI", value: pickedImageURI },
      { queryId: "uploadedImageLocation", value: uploadedImageLocation },
    ]);

    router.push("/home/create/details");
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        padding: 15,
        gap: 10,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View
        id="upload-image-area"
        style={{
          width: "100%",
          aspectRatio: 1,
        }}
      >
        <View
          id="upload-indicator"
          style={{
            zIndex: 1,
            display: isImageUploading ? undefined : "none",
            position: "absolute",
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
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

        <Pressable
          onPress={handlePickImage}
          id="placeholder"
          style={{
            display: pickedImageURI ? "none" : undefined,
            width: "100%",
            aspectRatio: 1,
            borderWidth: 1,
            borderRadius: 10,
            borderColor: "gray",
            borderStyle: "dashed",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons name="image-plus" size={64} color="gray" />
        </Pressable>

        <Animated.View
          id="image-preview"
          style={{
            width: "100%",
            aspectRatio: 1,
            display: pickedImageURI ? undefined : "none",
            opacity: imagePreviewOpacityValue,
          }}
        >
          <Image
            source={pickedImageURI}
            style={{
              width: "100%",
              aspectRatio: 1,
              borderRadius: 20,
            }}
            transition={500}
          />
        </Animated.View>
      </View>

      <Animated.View
        id="remove-image-aera"
        style={{
          width: "100%",
          alignItems: "center",
          opacity: removeImageButtonOpactiyValue,
        }}
      >
        <Pressable
          disabled={!pickedImageURI}
          onPress={handleRemoveImage}
          style={{
            padding: 10,
            borderWidth: 1,
            borderColor: "white",
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text fontSize={12}>Remove</Text>
        </Pressable>
      </Animated.View>

      <Animated.View
        id="continue-area"
        style={{
          width: "100%",
          alignItems: "flex-end",
          opacity: nextButtonOpacityValue,
        }}
      >
        <Pressable
          disabled={!uploadedImageLocation}
          onPress={handleNextButton}
          style={{
            padding: 10,
            backgroundColor: "white",
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            gap: 5,
          }}
        >
          <Text
            style={{
              color: "black",
            }}
          >
            Next
          </Text>
          <AntDesign name="arrowright" size={18} color="black" />
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
};

export default index;
