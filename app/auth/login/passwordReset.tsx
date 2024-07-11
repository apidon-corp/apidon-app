import { apidonPink } from "@/constants/Colors";

import { router } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Keyboard,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import auth from "@react-native-firebase/auth";

type Props = {};

const passwordReset = (props: Props) => {
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);

  const [loading, setLoading] = useState(false);

  const opacity = useRef(new Animated.Value(0.5)).current;

  const containerRef = useRef<null | View>(null);
  const screenHeight = Dimensions.get("window").height;
  const animatedTranslateValue = useRef(new Animated.Value(0)).current;

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
  }, []);

  useEffect(() => {
    if (isEmailValid) {
      changeOpacity(1);
    } else {
      changeOpacity(0.5);
    }
  }, [isEmailValid]);

  const changeOpacity = (toValue: number) => {
    Animated.timing(opacity, {
      toValue: toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleEmailChange = (input: string) => {
    setEmail(input);

    const emailRegex =
      /^[A-Za-z0-9._%+-]+@(gmail|yahoo|outlook|aol|icloud|protonmail|yandex|mail|zoho)\.(com|net|org)$/i;
    const emailRegexTestResult = emailRegex.test(input);

    setIsEmailValid(emailRegexTestResult);
  };

  const handleResetPasswordButton = async () => {
    if (!isEmailValid || loading || !email) return;

    setLoading(true);

    try {
      await auth().sendPasswordResetEmail(email);
      router.push("/auth/login/passwordResetSend");
    } catch (error) {
      console.error("Error on sending password reset email.");
    }

    setLoading(false);
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
          justifyContent: "center",
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={{
            gap: 20,
            alignItems: "center",
            justifyContent: "center",
            padding: 15,
            transform: [{ translateY: animatedTranslateValue }],
          }}
          ref={containerRef}
        >
          <Image
            source={require("@/assets/images/logo.png")}
            style={{
              height: "20%",
              aspectRatio: 1,
            }}
          />
          <Text
            style={{
              color: "white",
              fontSize: 25,
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            Reset Password
          </Text>
          <Text
            style={{
              color: "#718096",
              fontSize: 13,
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            Enter the email address for your Apidon account and we'll send a
            password reset link.
          </Text>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#808080"
            style={{
              backgroundColor: "black",
              borderWidth: 1,
              borderColor: "white",
              borderRadius: 10,
              padding: 10,
              width: "100%",
              color: "white",
            }}
            autoCapitalize="none"
            value={email}
            onChangeText={handleEmailChange}
            onSubmitEditing={handleResetPasswordButton}
          />
          <Animated.View
            style={{
              opacity: opacity,
              width: "100%",
              alignItems: "center",
            }}
          >
            <Pressable
              onPress={handleResetPasswordButton}
              style={{
                backgroundColor: apidonPink,
                padding: 10,
                borderRadius: 10,
                width: "100%",
              }}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  style={{
                    textAlign: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: 14,
                  }}
                >
                  Reset Password
                </Text>
              )}
            </Pressable>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default passwordReset;
