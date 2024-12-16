import { Text } from "@/components/Text/Text";
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

import Animated, { useSharedValue, withTiming } from "react-native-reanimated";

import auth from "@react-native-firebase/auth";
import { router } from "expo-router";

const emailPasswordSignIn = () => {
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const errorOpacity = useSharedValue(1);
  const buttonOpactiy = useSharedValue(1);

  const [loading, setLoading] = useState(false);
  const [buttonActiveStatus, setButtonActiveStatus] = useState(false);

  const bodyContainerRef = useRef<null | View>(null);
  const containerRef = useRef<null | View>(null);
  const screenHeight = Dimensions.get("window").height;
  const animatedTranslateValue = useSharedValue(0);

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
      password.length > 0 && !loading && error.length === 0;

    setButtonActiveStatus(buttonActiveStatusDetermined);
  }, [password, loading, error]);

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

              animatedTranslateValue.value = withTiming(-toValue, {
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
        animatedTranslateValue.value = withTiming(0, {
          duration: 250,
        });
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const handlePasswordChage = (input: string) => {
    setError("");
    setPassword(input);
  };

  const handleDeleteAccount = async () => {
    if (!buttonActiveStatus) return;
    if (password.length === 0 || loading || error.length > 0) return;

    setLoading(true);

    try {
      const currentUserAuthObject = auth().currentUser;

      if (!currentUserAuthObject) {
        console.log("No current user found");
        return setLoading(false);
      }

      const email = currentUserAuthObject.email;
      if (!email) {
        console.log("No email found");
        return setLoading(false);
      }

      const passwordCredential = auth.EmailAuthProvider.credential(
        email,
        password
      );

      await currentUserAuthObject.reauthenticateWithCredential(
        passwordCredential
      );

      await currentUserAuthObject.delete();
      console.log("User deleted successfully");

      router.replace("/auth/welcome");

      return setLoading(false);

      // We will be automatically sent to the welcome screen.
    } catch (error) {
      console.error("Error on login with email and password: ", error);
      setError("Invalid Password");
      return setLoading(false);
    }
  };

  const changeErrorOpacity = (toValue: number) => {
    errorOpacity.value = withTiming(toValue, { duration: 400 });
  };

  const changeButtonOpacity = (toValue: number) => {
    buttonOpactiy.value = withTiming(toValue, { duration: 400 });
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
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
            Enter Your Password
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
                  backgroundColor: "red",
                  borderRadius: 10,
                  padding: 10,
                  width: "50%",
                  alignItems: "center",
                }}
                onPress={handleDeleteAccount}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text
                    style={{
                      color: "white",
                    }}
                  >
                    Delete
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
      </Animated.View>
    </ScrollView>
  );
};

export default emailPasswordSignIn;
