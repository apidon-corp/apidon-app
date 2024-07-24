import {
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  Animated,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Text } from "@/components/Text/Text";
import React, { useEffect, useRef, useState } from "react";
import { useAtomValue } from "jotai";
import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import { Ionicons, Entypo } from "@expo/vector-icons";
import apiRoutes from "@/helpers/ApiRoutes";
import appCheck from "@react-native-firebase/app-check";
import auth from "@react-native-firebase/auth";
import { router } from "expo-router";

const verifyEmail = () => {
  const parameters = useAtomValue(screenParametersAtom);

  const email = parameters.find((p) => p.queryId === "email")?.value || "";
  const password =
    parameters.find((p) => p.queryId === "password")?.value || "";

  const [code, setCode] = useState("");
  const [isCodeValid, setIsCodeValid] = useState(false);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const errorOpacity = useRef(new Animated.Value(1)).current;
  const buttonOpactiy = useRef(new Animated.Value(1)).current;

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

  const changeButtonOpacity = (toValue: number) => {
    Animated.timing(buttonOpactiy, {
      toValue: toValue,
      duration: 400,
      useNativeDriver: true,
    }).start();
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
        return setLoading(false);
      }

      setLoading(false);

      // Good to go....
      // New auth object is created on the server with above request while verifying code.

      // We are now signing-in user...

      await auth().signInWithEmailAndPassword(email, password);

      const currentUser = auth().currentUser;
      if (!currentUser) {
        console.error(
          "No current user found after sign-in with email password after verify email."
        );
        setError("Server Error");
        return setLoading(false);
      }

      const idToken = await currentUser.getIdTokenResult(true);

      const isValidAuthObject = idToken.claims.isValidAuthObject;

      if (!isValidAuthObject) {
        console.log("User's auth object is not valid...");
        console.log("User didn't complete sign-up operation or a new user.");
        console.log("We are switching additionalInfo page now.");

        router.push("/auth/additionalInfo");

        return setLoading(false);
      }

      console.error("User has a valid object after verifying email...");
      console.error("That is not expected...");

      setError("Server Error");

      return setLoading(false);
    } catch (error) {
      console.error("Error during verifyEmail: ", error);
      setError("Server Error");
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flex: 1,
      }}
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
          <Text
            style={{
              color: "gray",
            }}
          >
            We've sent a code to
            <Text style={{ textDecorationLine: "underline", color: "cyan" }}>
              {email}
            </Text>
          </Text>
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
                  onChangeText={handleCodeChange}
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
    </ScrollView>
  );
};

export default verifyEmail;
