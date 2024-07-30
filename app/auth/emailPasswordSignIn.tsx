import { Text } from "@/components/Text/Text";
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

import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/providers/AuthProvider";
import auth from "@react-native-firebase/auth";

const emailPasswordSignIn = () => {
  const { setAuthStatus } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
      email.length > 0 && password.length > 0 && !loading && error.length === 0;

    setButtonActiveStatus(buttonActiveStatusDetermined);
  }, [email, password, loading, error]);

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
    setError("");
    const lowercasedInput = input.toLowerCase().trim();
    setEmail(lowercasedInput);
  };

  const handlePasswordChage = (input: string) => {
    setError("");
    setPassword(input);
  };

  const handleContinueButton = async () => {
    if (!buttonActiveStatus) return;
    if (
      email.length === 0 ||
      password.length === 0 ||
      loading ||
      error.length > 0
    )
      return;

    setLoading(true);

    setAuthStatus("dontMess");

    try {
      const user = (await auth().signInWithEmailAndPassword(email, password))
        .user;

      const idTokenResult = await user.getIdTokenResult(true);

      const isValidAuthObject = idTokenResult.claims.isValidAuthObject;

      if (!isValidAuthObject) {
        console.log("User didn't complete sign-up operation or a new user.");
        console.log("We are switching additionalInfo page now.");
        router.push("/auth/additionalInfo");
        return setLoading(false);
      }

      // We are setting this manually due to dontMess state...
      setAuthStatus("authenticated");

      router.replace("/home");

      return setLoading(false);
    } catch (error) {
      console.error("Error on login with email and password: ", error);
      setAuthStatus("unauthenticated");

      setError("Invalid Email or Password");

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

  const handleDontHaveAccount = () => {
    router.replace("/auth/emailPasswordSignUp");
  };

  const handleForgotPassword = () => {
    router.replace("/auth/forgotPassword");
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
            Welcome Back
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
                    style={{
                      width: "100%",
                      height: 45,
                      color: "white",
                      padding: 10,
                    }}
                    placeholder="Email"
                    placeholderTextColor="#808080"
                    autoCapitalize="none"
                    keyboardType="default"
                    value={email}
                    onChangeText={handleEmailChange}
                  />
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
                    style={{
                      width: "100%",
                      height: 45,
                      color: "white",
                      padding: 10,
                    }}
                    placeholder="Password"
                    placeholderTextColor="#808080"
                    autoCapitalize="none"
                    keyboardType="default"
                    value={password}
                    secureTextEntry
                    onChangeText={handlePasswordChage}
                  />
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
            justifyContent: "center",
            alignItems: "center",
            gap: 20,
          }}
        >
          <Pressable onPress={handleForgotPassword}>
            <Text
              style={{
                textDecorationLine: "underline",
              }}
            >
              Forgot Password? Reset It
            </Text>
          </Pressable>
          <Pressable onPress={handleDontHaveAccount}>
            <Text
              style={{
                textDecorationLine: "underline",
              }}
              bold
            >
              Don't have an account? Sign Up!
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

export default emailPasswordSignIn;
