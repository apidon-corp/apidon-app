import { apidonPink } from "@/constants/Colors";
import { auth } from "@/firebase/client";
import { router } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from "react-native";

type Props = {};

const passwordReset = (props: Props) => {
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);

  const [loading, setLoading] = useState(false);

  const opacity = useRef(new Animated.Value(0.5)).current;

  const changeOpacity = (toValue: number) => {
    Animated.timing(opacity, {
      toValue: toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (isEmailValid) {
      changeOpacity(1);
    } else {
      changeOpacity(0.5);
    }
  }, [isEmailValid]);

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
      await sendPasswordResetEmail(auth, email);
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
      <View
        style={{
          flex: 1,
          gap: 20,
          alignItems: "center",
          justifyContent: "center",
          padding: 15,
        }}
      >
        <Image
          source={require("@/assets/images/logo.png")}
          style={{
            height: "12%",
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
            width: "85%",
            color: "white",
          }}
          autoCapitalize="none"
          value={email}
          onChangeText={handleEmailChange}
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
              width: "85%",
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
      </View>
    </SafeAreaView>
  );
};

export default passwordReset;
