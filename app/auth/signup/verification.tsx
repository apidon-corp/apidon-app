import {
  View,
  Text,
  Image,
  TextInput,
  Pressable,
  Animated,
  Dimensions,
  ScrollView,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { SignUpApiErrorResponseBody } from "@/types/ApiResponses";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/client";
import { apidonPink } from "@/constants/Colors";

type Props = {};

const verification = (props: Props) => {
  const { email, password, username, fullname, referralCode } =
    useLocalSearchParams<{
      email: string;
      password: string;
      username: string;
      fullname: string;
      referralCode: string;
    }>();

  const [verificationCode, setVerificationCode] = useState("");

  const [error, setError] = useState("");

  const containerRef = useRef<null | View>(null);
  const screenHeight = Dimensions.get("window").height;
  const animatedTranslateValue = useRef(new Animated.Value(0)).current;

  const [loading, setLoading] = useState(false);

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

  const handleVerifyButton = async () => {
    const status =
      email &&
      password &&
      username &&
      fullname &&
      referralCode &&
      verificationCode;

    if (!status) return;

    Keyboard.dismiss();

    setLoading(true);

    const emailDecoded = decodeURI(email);
    const passwordDecoded = decodeURI(password);
    const usernameDecoded = decodeURI(username);
    const fullnameDecoded = decodeURI(fullname);
    const referralCodeDecoded = decodeURI(referralCode);

    await handleSignUp(
      emailDecoded,
      passwordDecoded,
      usernameDecoded,
      fullnameDecoded,
      referralCodeDecoded
    );

    setLoading(false);
  };

  /**
   * This function handles all operations on signup including error handling.
   * @param email
   * @param password
   * @returns
   */
  const handleSignUp = async (
    email: string,
    password: string,
    username: string,
    fullname: string,
    referralCode: string
  ) => {
    const userPanelBaseUrl = process.env.EXPO_PUBLIC_USER_PANEL_ROOT_URL;
    if (!userPanelBaseUrl) {
      return console.error("User panel base url couldnt fetch from .env file");
    }

    const userPanelApiKey = process.env.EXPO_PUBLIC_USER_PANEL_API_KEY;
    if (!userPanelApiKey) {
      return console.error("User panel api key couldnt fetch from .env file");
    }

    const fetchUrl = `${userPanelBaseUrl}/api/user/authentication/signup/signup`;

    try {
      const response = await fetch(fetchUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: userPanelApiKey,
        },
        body: JSON.stringify({
          referralCode: referralCode,
          email: email,
          password: password,
          username: username,
          fullname: fullname,
          verificationCode: verificationCode,
        }),
      });

      if (!response.ok) {
        const result = (await response.json()) as SignUpApiErrorResponseBody;

        const cause = result.cause;
        const message = result.message;

        console.error("Cause: ", cause, " Message: ", message);

        if (cause === "referralCode") {
          return router.push("/auth/signup/index");
        } else if (
          cause === "email" ||
          cause === "password" ||
          cause === "username" ||
          cause === "fullname"
        ) {
          return router.push("/auth/signup/secondPhase");
        } else if (cause === "verificationCode") {
          return setError(message);
        } else if (cause === "server") {
          return console.error("Server Error");
        }
      }

      // User created successfully...
      const createdUser = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      return console.log("User created successfully.");
    } catch (error) {
      return console.error("Error on fetching to signup API: ", error);
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
          justifyContent: "center",
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          ref={containerRef}
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            padding: 15,
            transform: [{ translateY: animatedTranslateValue }],
          }}
        >
          <Image
            source={require("@/assets/images/logo.png")}
            style={{
              height: "20%",
              aspectRatio: 1,
            }}
          />
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 20 }}>
            Verify Your Account
          </Text>
          <Text
            style={{
              color: "#718096",
              fontWeight: "bold",
              fontSize: 14,
              textAlign: "center",
            }}
          >
            To continue, please enter your verification code. We've sent it to{" "}
            <Text style={{ color: "rgb(49, 130, 206)", fontWeight: "bold" }}>
              {email}
            </Text>
          </Text>
          <TextInput
            placeholder="Verification Code"
            style={{
              backgroundColor: "black",
              padding: 10,
              borderWidth: 1,
              borderColor: "white",
              borderRadius: 10,
              width: "100%",
              color: "white",
            }}
            placeholderTextColor="#808080"
            keyboardType="numeric"
            onChangeText={setVerificationCode}
          />
          {error && (
            <Text
              style={{
                color: "red",
                fontWeight: "bold",
                fontSize: 14,
                textAlign: "center",
              }}
            >
              Verification code invalid
            </Text>
          )}

          <Pressable
            style={{
              backgroundColor: apidonPink,
              padding: 10,
              borderRadius: 10,
              width: "100%",
            }}
            onPress={handleVerifyButton}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 14,
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                Verify
              </Text>
            )}
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default verification;
