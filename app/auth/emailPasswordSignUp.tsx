import { Text } from "@/components/Text/Text";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
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

import appCheck from "@react-native-firebase/app-check";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import apiRoutes from "@/helpers/ApiRoutes";
import { useSetAtom } from "jotai";
import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import { router } from "expo-router";

const emailPasswordSignUp = () => {
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [error, setError] = useState("");

  const errorOpacity = useRef(new Animated.Value(1)).current;
  const buttonOpactiy = useRef(new Animated.Value(1)).current;

  const [loading, setLoading] = useState(false);
  const [buttonActiveStatus, setButtonActiveStatus] = useState(false);

  const bodyContainerRef = useRef<null | View>(null);
  const containerRef = useRef<null | View>(null);
  const screenHeight = Dimensions.get("window").height;
  const animatedTranslateValue = useRef(new Animated.Value(0)).current;

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
    if (error.length === 0) {
      changeErrorOpacity(0);
    } else {
      changeErrorOpacity(1);
    }
  }, [error]);

  // Continue Button Status Handling
  useEffect(() => {
    const buttonActiveStatusDetermined =
      isEmailValid && isPasswordValid && !loading;

    setButtonActiveStatus(buttonActiveStatusDetermined);
  }, [isEmailValid, isPasswordValid, loading]);

  // Continue Button Opacity Handling
  useEffect(() => {
    if (buttonActiveStatus) {
      changeButtonOpacity(1);
    } else {
      changeButtonOpacity(0.5);
    }
  }, [buttonActiveStatus]);

  // Keyboard-Layout Change
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      "keyboardWillShow",
      (event) => {
        if (Keyboard.isVisible()) return;

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

              Animated.timing(animatedTranslateValue, {
                toValue: -toValue,
                duration: 250,
                useNativeDriver: true,
              }).start();
            }
          );
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
      return setLoading(false);
    }
  };

  const changeErrorOpacity = (toValue: number) => {
    Animated.timing(errorOpacity, {
      toValue: toValue,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const changeButtonOpacity = (toValue: number) => {
    Animated.timing(buttonOpactiy, {
      toValue: toValue,
      duration: 400,
      useNativeDriver: true,
    }).start();
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
    >
      <Animated.View
        ref={containerRef}
        id="root"
        style={{
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          transform: [{ translateY: animatedTranslateValue }],
        }}
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
              style={{
                width: "100%",
                alignItems: "center",
                opacity: buttonOpactiy,
              }}
            >
              <Pressable
                disabled={!buttonActiveStatus}
                id="continue-button"
                style={{
                  backgroundColor: "white",
                  borderRadius: 10,
                  padding: 10,
                  width: "50%",
                  alignItems: "center",
                }}
                onPress={handleContinueButton}
              >
                {loading ? (
                  <ActivityIndicator color="black" />
                ) : (
                  <Text
                    style={{
                      color: "black",
                    }}
                  >
                    Continue
                  </Text>
                )}
              </Pressable>
            </Animated.View>

            <Animated.View
              id="error"
              style={{
                alignItems: "center",
                justifyContent: "center",
                height: 50,
                opacity: errorOpacity,
              }}
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
