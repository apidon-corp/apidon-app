import { Text } from "@/components/Text/Text";
import { apidonPink } from "@/constants/Colors";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Keyboard,
  Pressable,
  SafeAreaView,
  ScrollView,
  TextInput,
  View,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

type Props = {};

const editProfile = (props: Props) => {
  const { image, fullname } = useLocalSearchParams<{
    image: string;
    fullname: string;
  }>();

  const [error, setError] = useState("");

  const [fullnameEdited, setFullnameEdited] = useState(fullname);
  const [isFullnameValid, setIsFullnameValid] = useState(true);
  const [isFullnameChanged, setIsFullnameChanged] = useState(false);

  const [imageEdited, setImageEdited] = useState("");

  const containerRef = useRef<null | View>(null);
  const screenHeight = Dimensions.get("window").height;
  const animatedTranslateValue = useRef(new Animated.Value(0)).current;

  const animatedOpacityValue = useRef(new Animated.Value(0.5)).current;

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
    if ((isFullnameValid && isFullnameChanged) || imageEdited.length > 0) {
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
  }, [fullnameEdited, fullname, imageEdited.length]);

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
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImageEdited(result.assets[0].uri);
    }
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
            {image && (
              <Image
                source={{
                  uri: imageEdited || decodeURI(image),
                }}
                style={{
                  width: 200,
                  aspectRatio: 1,
                  borderRadius: 100,
                }}
              />
            )}
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
                {imageEdited ? "Try New One" : "Change Image"}
              </Text>
            </Pressable>
          </View>
          <View
            style={{
              width: "100%",
              gap: 5,
            }}
          >
            <Text>Fullname</Text>
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
            }}
          >
            <Pressable
              style={{
                padding: 10,
                backgroundColor: apidonPink,
                borderRadius: 10,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                }}
              >
                Save
              </Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default editProfile;
