import { CheckThereIsLinkedAccountApiResponseBody } from "@/types/ApiResponses";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
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

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  const handleLoginButton = () => {
    if (!username || !email) return;
    router.push(`/auth/login/password?email=${email}&username=${username}`);
  };

  const handleEmailUsernameChange = (input: string) => {
    setEmailUsername(input);

    const emailRegex =
      /^[A-Za-z0-9._%+-]+@(gmail|yahoo|outlook|aol|icloud|protonmail|yandex|mail|zoho)\.(com|net|org)$/i;
    const emailRegexTestResult = emailRegex.test(input);

    const usernameRegex = /^[a-z0-9]{4,20}$/;
    const usernameRegexTestResult = usernameRegex.test(input);

    if (emailRegexTestResult || usernameRegexTestResult) {
      handleGetUserData(input);
    } else {
      resetStatesAfterFailure();
    }
  };

  const handleGetUserData = async (emailOrUsername: string) => {
    try {
      const userPanelBaseUrl = process.env.EXPO_PUBLIC_USER_PANEL_ROOT_URL;
      if (!userPanelBaseUrl) {
        console.error("User panel base url couldnt fetch from .env file");
        return false;
      }

      const userPanelApiKey = process.env.EXPO_PUBLIC_USER_PANEL_API_KEY;
      if (!userPanelApiKey) {
        console.error("User panel api key couldnt fetch from .env file");
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
        resetStatesAfterFailure();
        return false;
      }

      const result =
        (await response.json()) as CheckThereIsLinkedAccountApiResponseBody;

      const emailFetched = result.email;
      const usernameFetched = result.username;

      setEmail(emailFetched);
      setUsername(usernameFetched);

      return true;
    } catch (error) {
      resetStatesAfterFailure();
      console.error(
        "Error on fetching to checkThereIsLinkedAccount API from apidon-user side: ",
        error
      );
      return false;
    }
  };

  const resetStatesAfterFailure = () => {
    setEmail("");
    setUsername("");
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
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
        <Pressable style={styles.continueButton} onPress={handleLoginButton}>
          <Text
            style={{ color: "white", textAlign: "center", fontWeight: "bold" }}
          >
            Continue
          </Text>
        </Pressable>
        <View style={styles.signUpView}>
          <Text style={{ color: "white" }}>Don't have account?</Text>
          <Link style={{ color: "cyan" }} href="/auth/signup">
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
    backgroundColor: "black",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#d53f8cd9",
  },
  signUpView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    marginTop: 20,
  },
});

export default index;
