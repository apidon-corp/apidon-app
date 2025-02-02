import { Text } from "@/components/Text/Text";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
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

import appCheck from "@react-native-firebase/app-check";

import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import apiRoutes from "@/helpers/ApiRoutes";
import crashlytics from "@react-native-firebase/crashlytics";
import { router } from "expo-router";
import { useSetAtom } from "jotai";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { apidonPink } from "@/constants/Colors";
import { ThemedButton } from "react-native-really-awesome-button";

const emailPasswordSignUp = () => {
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [error, setError] = useState("");

  const errorOpacity = useSharedValue(1);
  const buttonOpacity = useSharedValue(1);

  const [loading, setLoading] = useState(false);
  const [buttonActiveStatus, setButtonActiveStatus] = useState(false);

  const bodyContainerRef = useRef<null | View>(null);
  const containerRef = useRef<null | View>(null);
  const screenHeight = Dimensions.get("window").height;

  const translateY = useSharedValue(0);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const errorAnimatedStyle = useAnimatedStyle(() => ({
    opacity: errorOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  const { bottom } = useSafeAreaInsets();

  const setScreenParameters = useSetAtom(screenParametersAtom);

  // Error Handling
  useEffect(() => {
    if (emailError && email.length > 0) return setError(emailError);
    if (passwordError && password.length > 0) return setError(passwordError);
    return setError("");
  }, [email, emailError, password, passwordError]);

  // Error Opacity Handling
  useEffect(() => {
    errorOpacity.value = withTiming(error.length === 0 ? 0 : 1, {
      duration: 400,
    });
  }, [error]);

  // Continue Button Status Handling
  useEffect(() => {
    const buttonActiveStatusDetermined =
      isEmailValid && isPasswordValid && !loading;

    setButtonActiveStatus(buttonActiveStatusDetermined);
  }, [isEmailValid, isPasswordValid, loading]);

  // Continue Button Opacity Handling
  useEffect(() => {
    buttonOpacity.value = withTiming(buttonActiveStatus ? 1 : 0.5, {
      duration: 400,
    });
  }, [buttonActiveStatus]);

  // Keyboard-Layout Change
  useEffect(() => {
    const isIOS = Platform.OS === "ios";

    const keyboardWillShowListener = Keyboard.addListener(
      isIOS ? "keyboardWillShow" : "keyboardDidShow",
      (event) => {
        if (isIOS && Keyboard.isVisible()) return;

        const keyboardHeight = event.endCoordinates.height;

        if (bodyContainerRef.current) {
          bodyContainerRef.current.measure(
            (x, y, width, height, pageX, pageY) => {
              const containerBottom = pageY + height;
              const distanceFromBottom = screenHeight - containerBottom;

              let toValue = 0;
              if (distanceFromBottom > keyboardHeight) {
                toValue = 0;
              } else {
                toValue = keyboardHeight - distanceFromBottom;
              }

              translateY.value = withTiming(-toValue, {
                duration: 250,
              });
            }
          );
        }
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      isIOS ? "keyboardWillHide" : "keyboardDidHide",
      (event) => {
        translateY.value = withTiming(0, {
          duration: 250,
        });
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const handleEmailChange = (input: string) => {
    const lowercasedInput = input.toLowerCase().trim();

    setEmail(lowercasedInput);
    setError("");

    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@(gmail\.com|icloud\.com|yahoo\.com|outlook\.com)$/i;
    const emailRegexTestResult = emailRegex.test(lowercasedInput);

    setIsEmailValid(emailRegexTestResult);

    if (!emailRegexTestResult) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChage = (input: string) => {
    setPassword(input);
    setPasswordError("");

    const minLength = 8;
    const hasLowerCase = /[a-z]/.test(input);
    const hasUpperCase = /[A-Z]/.test(input);
    const hasDigit = /\d/.test(input);

    if (input.length < minLength) {
      setIsPasswordValid(false);
      return setPasswordError("Password must be at least 8 characters long.");
    } else if (!hasLowerCase) {
      setIsPasswordValid(false);
      return setPasswordError(
        "Password must contain at least one lowercase letter."
      );
    } else if (!hasUpperCase) {
      setIsPasswordValid(false);
      return setPasswordError(
        "Password must contain at least one uppercase letter."
      );
    } else if (!hasDigit) {
      setIsPasswordValid(false);
      return setPasswordError("Password must contain at least one digit.");
    } else {
      setIsPasswordValid(true);
      return setPasswordError("");
    }
  };

  const handleContinueButton = async () => {
    if (!isEmailValid || !isPasswordValid || loading) return;
    if (!buttonActiveStatus) return;

    setLoading(true);

    try {
      const { token: appchecktoken } = await appCheck().getLimitedUseToken();

      const response = await fetch(
        apiRoutes.user.authentication.signup.sendVerificationCode,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            appchecktoken,
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      if (!response.ok) {
        const message = await response.text();

        console.error(
          "Response from sendVerificationCode is not okay: ",
          message
        );

        if (message === "Email is already taken.") {
          setIsEmailValid(false);
        }

        setEmailError(message);

        return setLoading(false);
      }

      setScreenParameters([
        { queryId: "email", value: email },
        { queryId: "password", value: password },
      ]);

      setLoading(false);

      return router.push("/auth/verifyEmail");
    } catch (error) {
      console.error("Error on sign-up: ", error);
      crashlytics().recordError(
        new Error(
          `Error on email-password sign up: (Screen: emailPassworsSignUp) (continue button: User tried to get verification code): \n: ${error}`
        )
      );
      return setLoading(false);
    }
  };

  const handleSignInButton = () => {
    router.replace("/auth/emailPasswordSignIn");
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flex: 1,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        ref={containerRef}
        id="root"
        style={[
          {
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          },
          containerAnimatedStyle,
        ]}
      >
        <View
          id="set-account-header"
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            gap: 20,
          }}
        >
          <View
            id="apidon-image"
            style={{
              width: "100%",
              alignItems: "center",
            }}
          >
            <Image
              source={require("@/assets/images/logo.png")}
              style={{
                width: 100,
                height: 100,
              }}
            />
          </View>
          <Text
            bold
            style={{
              fontSize: 32,
            }}
          >
            Create Account
          </Text>
        </View>

        <View
          ref={bodyContainerRef}
          id="body"
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
            gap: 20,
          }}
        >
          <View id="inputs" style={{ width: "100%", gap: 20 }}>
            <View id="email" style={{ gap: 10 }}>
              <Text bold>Email</Text>
              <View
                style={{
                  position: "relative",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "white",
                  borderRadius: 10,
                }}
              >
                <View id="input" style={{ paddingRight: 40 }}>
                  <TextInput
                    style={[
                      {
                        width: "100%",
                        height: 45,
                        color: "white",
                        padding: 10,
                      },
                      {
                        borderColor:
                          isEmailValid || email.length === 0 ? "white" : "red",
                      },
                    ]}
                    placeholder="Email"
                    placeholderTextColor="#808080"
                    autoCapitalize="none"
                    keyboardType="default"
                    value={email}
                    onChangeText={handleEmailChange}
                  />
                </View>

                <View
                  id="indicator"
                  style={{
                    position: "absolute",
                    right: 10,
                  }}
                >
                  {email.length === 0 ? (
                    <></>
                  ) : isEmailValid ? (
                    <Ionicons name="checkmark-circle" size={24} color="green" />
                  ) : (
                    <Entypo name="circle-with-cross" size={24} color="red" />
                  )}
                </View>
              </View>
            </View>
            <View id="password" style={{ gap: 10 }}>
              <Text bold>Password</Text>
              <View
                style={{
                  position: "relative",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "white",
                  borderRadius: 10,
                }}
              >
                <View id="input" style={{ paddingRight: 40 }}>
                  <TextInput
                    style={[
                      {
                        width: "100%",
                        height: 45,
                        color: "white",
                        padding: 10,
                      },
                      {
                        borderColor:
                          isEmailValid || email.length === 0 ? "white" : "red",
                      },
                    ]}
                    placeholder="Password"
                    placeholderTextColor="#808080"
                    autoCapitalize="none"
                    keyboardType="default"
                    value={password}
                    secureTextEntry
                    onChangeText={handlePasswordChage}
                  />
                </View>

                <View
                  id="indicator"
                  style={{
                    position: "absolute",
                    right: 10,
                  }}
                >
                  {password.length === 0 ? (
                    <></>
                  ) : isPasswordValid ? (
                    <Ionicons name="checkmark-circle" size={24} color="green" />
                  ) : (
                    <Entypo name="circle-with-cross" size={24} color="red" />
                  )}
                </View>
              </View>
            </View>

            <Animated.View
              id="button-root"
              style={{
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                opacity: buttonOpacity,
                borderRadius: 20,
                marginTop : 10
              }}
              pointerEvents={buttonActiveStatus ? "auto" : "none"}
            >
              <ThemedButton
                progress
                onPress={async (next) => {
                  await handleContinueButton();
                  if (next) next();
                }}
                backgroundProgress="rgb(50, 50, 50)"
                name="rick"
                width={200}
                height={200 * 0.22}
                paddingBottom={0}
                paddingHorizontal={0}
                paddingTop={0}
                backgroundColor={apidonPink}
                backgroundDarker="rgba(213, 63, 140, 0.5)"
              >
                <Text bold>Continue</Text>
              </ThemedButton>
            </Animated.View>

            <Animated.View
              id="error"
              style={[
                {
                  alignItems: "center",
                  justifyContent: "center",
                  height: 50,
                },
                errorAnimatedStyle,
              ]}
            >
              <Text
                style={{
                  color: "red",
                  textAlign: "center",
                }}
                fontSize={12}
              >
                {error}
              </Text>
            </Animated.View>
          </View>
        </View>

        <View
          id="already-have-account"
          style={{
            position: "absolute",
            bottom: bottom + 10,
            padding: 10,
          }}
        >
          <Pressable onPress={handleSignInButton}>
            <Text
              style={{
                textDecorationLine: "underline",
              }}
              bold
            >
              Already have account? Sign In!
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

export default emailPasswordSignUp;
