import { CheckThereIsLinkedAccountApiResponseBody } from "@/types/ApiResponses";
import { Link, router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const index = () => {
  const [emailUsername, setEmailUsername] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("regex");

  const [isEmail, setIsEmail] = useState(false);

  const opacity = useRef(new Animated.Value(1)).current;

  const changeOpacity = (toValue: number) => {
    Animated.timing(opacity, {
      toValue: toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (error.length > 0) {
      changeOpacity(0.5);
    } else {
      changeOpacity(1);
    }
  }, [error]);

  const handleLoginButton = async () => {
    setLoading(true);

    const userDataResult = await handleGetUserData(emailUsername, isEmail);

    if (userDataResult) {
      const encodedEmail = encodeURI(userDataResult.email);
      const encodedUsername = encodeURI(userDataResult.username);

      router.push(
        `/auth/login/password?email=${encodedEmail}&username=${encodedUsername}`
      );
    }

    setLoading(false);
  };

  const handleEmailUsernameChange = (input: string) => {
    setEmailUsername(input);
    setError("");

    const emailRegex =
      /^[A-Za-z0-9._%+-]+@(gmail|yahoo|outlook|aol|icloud|protonmail|yandex|mail|zoho)\.(com|net|org)$/i;
    const emailRegexTestResult = emailRegex.test(input);

    const usernameRegex = /^[a-z0-9]{4,20}$/;
    const usernameRegexTestResult = usernameRegex.test(input);

    setIsEmail(emailRegexTestResult);

    if (!(emailRegexTestResult || usernameRegexTestResult)) {
      setError("regex");
    }
  };

  const handleGetUserData = async (
    emailOrUsername: string,
    isEmail: boolean
  ) => {
    setError("");

    try {
      const userPanelBaseUrl = process.env.EXPO_PUBLIC_USER_PANEL_ROOT_URL;
      if (!userPanelBaseUrl) {
        console.error("User panel base url couldnt fetch from .env file");

        setError("Internal Server Error");
        return false;
      }

      const userPanelApiKey = process.env.EXPO_PUBLIC_USER_PANEL_API_KEY;
      if (!userPanelApiKey) {
        console.error("User panel api key couldnt fetch from .env file");

        setError("Internal Server Error");
        return false;
      }

      const fetchUrl = `${userPanelBaseUrl}/api/user/authentication/login/checkIsThereLinkedAccount`;

      const response = await fetch(fetchUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: userPanelApiKey,
        },
        body: JSON.stringify({
          eu: emailOrUsername,
        }),
      });

      if (!response.ok) {
        console.error(
          "Response from ",
          fetchUrl,
          " is not okay: ",
          await response.text()
        );

        setError("Internal Server Error");

        return false;
      }

      const result =
        (await response.json()) as CheckThereIsLinkedAccountApiResponseBody;

      const emailFetched = result.email;
      const usernameFetched = result.username;

      if (!emailFetched || !usernameFetched) {
        if (isEmail) {
          setError("No account found with this email.");
        } else {
          setError("No account found with this username.");
        }

        return false;
      }

      return {
        email: emailFetched,
        username: usernameFetched,
      };
    } catch (error) {
      console.error(
        "Error on fetching to checkThereIsLinkedAccount API from apidon-user side: ",
        error
      );
      setError("Internal Server Error");
      return false;
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <KeyboardAvoidingView style={styles.container}>
        <Image
          style={styles.logoImage}
          source={require("@/assets/images/logo.png")}
        />
        <Text style={styles.welcome}>Welcome back to Apidon!</Text>
        <Text style={styles.emailPasswordText}>
          To continue, please enter your email address or username. You'll be
          prompted for your password on the next screen.
        </Text>
        <TextInput
          style={styles.emailOrUsernameInput}
          placeholder="Email or Username"
          placeholderTextColor="#808080"
          autoCapitalize="none"
          keyboardType="email-address"
          value={emailUsername}
          onChangeText={handleEmailUsernameChange}
        />
        <Animated.View
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            opacity: opacity,
          }}
        >
          <Pressable
            onPress={handleLoginButton}
            style={styles.continueButton}
            disabled={error.length > 0}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Continue
              </Text>
            )}
          </Pressable>
        </Animated.View>

        {error.length !== 0 && error !== "regex" && (
          <Text
            style={{
              color: "red",
              textAlign: "center",
              fontSize: 14,
            }}
          >
            {error}
          </Text>
        )}

        <View style={styles.signUpView}>
          <Text style={{ color: "white" }}>Don't have account?</Text>
          <Link style={{ color: "#d53f8cd9" }} href="/auth/signup">
            Sign Up!
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    gap: 20,
  },
  logoImage: {
    height: "12%",
    aspectRatio: 1,
  },
  welcome: {
    color: "white",
    fontSize: 25,
    textAlign: "center",
    fontWeight: "bold",
  },
  emailPasswordText: {
    color: "#718096",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "bold",
  },
  emailOrUsernameInput: {
    width: "100%",
    height: 45,
    color: "white",
    backgroundColor: "black",
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 10,
    padding: 10,
  },
  continueButton: {
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "rgb(213,63,140)",
  },
  signUpView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
  },
});

export default index;
