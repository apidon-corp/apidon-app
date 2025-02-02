import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import { Text } from "@/components/Text/Text";
import { apidonPink } from "@/constants/Colors";
import apiRoutes from "@/helpers/ApiRoutes";
import { useAuth } from "@/providers/AuthProvider";
import { Entypo, Ionicons } from "@expo/vector-icons";
import appCheck from "@react-native-firebase/app-check";
import auth from "@react-native-firebase/auth";
import crashlytics from "@react-native-firebase/crashlytics";
import { router } from "expo-router";
import { useAtomValue } from "jotai";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text as NativeText,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { ThemedButton } from "react-native-really-awesome-button";

import Animated, { useSharedValue, withTiming } from "react-native-reanimated";

const verifyEmail = () => {
  const { setAuthStatus } = useAuth();

  const parameters = useAtomValue(screenParametersAtom);

  const email = parameters.find((p) => p.queryId === "email")?.value || "";
  const password =
    parameters.find((p) => p.queryId === "password")?.value || "";

  const [code, setCode] = useState("");
  const [isCodeValid, setIsCodeValid] = useState(false);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const animatedErrorOpactiy = useSharedValue(0);
  const animatedButtonOpacity = useSharedValue(0);

  const [buttonActiveStatus, setButtonActiveStatus] = useState(false);

  // Continue Button Status Handling
  useEffect(() => {
    const buttonActiveStatusDetermined =
      code.length > 0 && !loading && isCodeValid;

    setButtonActiveStatus(buttonActiveStatusDetermined);
  }, [code, loading, isCodeValid]);

  // Continue Button Opacity Handling
  useEffect(() => {
    if (buttonActiveStatus) {
      changeButtonOpacity(1);
    } else {
      changeButtonOpacity(0.5);
    }
  }, [buttonActiveStatus]);

  // Error opacity handling
  useEffect(() => {
    animatedErrorOpactiy.value = withTiming(error.length === 0 ? 0 : 1, {
      duration: 400,
    });
  }, [error]);

  const changeButtonOpacity = (toValue: number) => {
    animatedButtonOpacity.value = withTiming(toValue, { duration: 250 });
  };

  const handleCodeChange = (input: string) => {
    if (input.length === 0) {
      setCode("");
      return setIsCodeValid(false);
    }

    const intVersion = parseInt(input);

    const isValidNumber = !isNaN(intVersion);

    if (!isValidNumber) {
      setError("Please enter a valid number");
      return setIsCodeValid(false);
    }
    setIsCodeValid(true);
    setError("");
    return setCode(input);
  };

  const handleContinueButton = async () => {
    if (!isCodeValid || loading) return;

    setLoading(true);

    setAuthStatus("dontMess");

    try {
      const { token: appchecktoken } = await appCheck().getLimitedUseToken();

      const response = await fetch(
        apiRoutes.user.authentication.signup.verifyEmail,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            appchecktoken,
          },
          body: JSON.stringify({
            email,
            password,
            verificationCode: code,
          }),
        }
      );

      if (!response.ok) {
        const message = await response.text();
        console.error("Response from verifyEmail API is not okay: ", message);

        if (message === "Verification code is invalid.") {
          setIsCodeValid(false);
        }

        setError(message);
        setAuthStatus("unauthenticated");
        return setLoading(false);
      }

      await auth().signInWithEmailAndPassword(email, password);

      const currentUser = auth().currentUser;
      if (!currentUser) {
        console.error(
          "No current user found after sign-in with email password after verify email."
        );
        setError("Server Error");
        setAuthStatus("unauthenticated");
        return setLoading(false);
      }

      const idToken = await currentUser.getIdTokenResult(true);

      const isValidAuthObject = idToken.claims.isValidAuthObject;

      if (!isValidAuthObject) {
        router.push("/auth/additionalInfo");
        return setLoading(false);
      }

      console.error("User has a valid object after verifying email...");
      console.error("That is not expected...");

      setError("Server Error");

      setAuthStatus("unauthenticated");

      return setLoading(false);
    } catch (error) {
      crashlytics().recordError(
        new Error(
          `Error during email verifying. (Screen: Verify Email): ${error} `
        )
      );
      console.error("Error during verifyEmail or sign-in ", error);
      setError("Server Error");
      setLoading(false);
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        flex: 1,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={{
          flex: 1,
          padding: 20,
          gap: 20,
        }}
      >
        <View
          id="enter-code-header"
          style={{
            gap: 10,
          }}
        >
          <Text fontSize={32} bold>
            Please Check Your Email
          </Text>
          <NativeText
            style={{
              color: "gray",
            }}
          >
            We've sent a code to{" "}
            <NativeText style={{ color: "cyan" }}>{email}</NativeText>
          </NativeText>
        </View>
        <View
          id="code-inputs"
          style={{
            width: "100%",
            flexDirection: "row",
            gap: 10,
          }}
        >
          <View id="Code" style={{ gap: 10, width: "100%" }}>
            <Text bold>Code</Text>
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
                  placeholder="Code"
                  placeholderTextColor="#808080"
                  autoCapitalize="none"
                  keyboardType="number-pad"
                  value={code}
                  onChangeText={(text) => handleCodeChange(text)}
                />
              </View>

              <View
                id="indicator"
                style={{
                  position: "absolute",
                  right: 10,
                }}
              >
                {code.length === 0 ? (
                  <></>
                ) : isCodeValid ? (
                  <Ionicons name="checkmark-circle" size={24} color="green" />
                ) : (
                  <Entypo name="circle-with-cross" size={24} color="red" />
                )}
              </View>
            </View>
          </View>
        </View>

        <Animated.View
          id="button-root"
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            opacity: animatedButtonOpacity,
            borderRadius: 20,
            marginTop: 10,
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
          style={{
            alignItems: "center",
            justifyContent: "center",
            height: 50,
            opacity: animatedErrorOpactiy,
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
    </ScrollView>
  );
};

export default verifyEmail;
