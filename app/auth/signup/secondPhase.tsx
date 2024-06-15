import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  StyleSheet,
  Image,
  Pressable,
} from "react-native";
import React, { useState } from "react";

import { MaterialIcons } from "@expo/vector-icons";
import {
  CheckThereIsLinkedAccountApiResponseBody,
  VerificationCodeSendApiErrorResponseBody,
} from "@/types/ApiResponses";
import { router, useLocalSearchParams } from "expo-router";

type Props = {};

const secondPhase = (props: Props) => {
  const { referralCode } = useLocalSearchParams<{
    referralCode: string;
  }>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");

  const [error, setError] = useState("");

  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [isFullnameValid, setIsFullnameValid] = useState(true);

  const [passwordStatus, setPasswordStatus] = useState({
    digit: false,
    lowercase: false,
    uppercase: false,
    eightCharacter: false,
    special: false,
  });

  const handleEmailChange = (input: string) => {
    setError("");
    setEmail(input);
    if (input.length === 0) return setIsEmailValid(true);
    const emailRegex =
      /^[A-Za-z0-9._%+-]+@(gmail|yahoo|outlook|aol|icloud|protonmail|yandex|mail|zoho)\.(com|net|org)$/i;
    const regexTestResult = emailRegex.test(input);
    setIsEmailValid(regexTestResult);
  };

  const handlePasswordChange = async (input: string) => {
    setPassword(input);

    if (input.length === 0) return setIsPasswordValid(true);

    const passwordRegex =
      /^(?=.*?\p{Lu})(?=.*?\p{Ll})(?=.*?\d)(?=.*?[^\w\s]|[_]).{12,}$/u;

    const regexTestResult = passwordRegex.test(input);

    setIsPasswordValid(regexTestResult);

    setPasswordStatus({
      digit: /^(?=.*?\d)/u.test(input),
      lowercase: /^(?=.*?\p{Ll})/u.test(input),
      uppercase: /^(?=.*?\p{Lu})/u.test(input),
      eightCharacter: /^.{12,}$/u.test(input),
      special: /^(?=.*?[^\w\s]|[_])/u.test(input),
    });
  };

  const handleUsernameChange = async (input: string) => {
    setError("");

    if (input.toLowerCase() !== input) {
      input = input.toLowerCase();
    }

    // Non-Spacing Help
    input = input.trimEnd();

    // Non-Special Help
    input = input.replace(/[^\w\s]$/, "");

    setUsername(input);

    if (input.length === 0) {
      setIsUsernameValid(true);
      setError("");
      return;
    }

    const usernameRegex = /^[a-z0-9]{4,20}$/;
    const regexTestResult = usernameRegex.test(input);

    setIsUsernameValid(regexTestResult);

    // Explain Error
    if (!regexTestResult)
      return setError(
        "Please enter a username consisting of 4 to 20 characters, using only lowercase letters (a-z) and digits (0-9)."
      );

    const usernameCanBeUsed = await checkUsernameCanBeUsed(input);
    if (!usernameCanBeUsed) setError("Username is taken :(");

    setIsUsernameValid(usernameCanBeUsed);
  };

  /**
   * @param username
   * @returns True If username not taken.
   */
  const checkUsernameCanBeUsed = async (username: string) => {
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
          eu: username,
        }),
      });

      if (!response.ok) {
        console.error(
          "Response from ",
          fetchUrl,
          " is not okay: ",
          await response.text()
        );
        return false;
      }

      const result =
        (await response.json()) as CheckThereIsLinkedAccountApiResponseBody;

      if (result.username) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      console.error(
        "Error on fetching to checkThereIsLinkedAccount API from apidon-user side: ",
        error
      );
      return false;
    }
  };

  const handleFullnameChange = (input: string) => {
    setError("");
    input = input.replace(/[^\p{L}\p{N}\s]/gu, "");
    setFullname(input);

    if (input.length === 0) return;

    const fullnameRegex = /^\p{L}{1,20}(?: \p{L}{1,20})*$/u;
    const regexTestResult = fullnameRegex.test(input);

    setIsFullnameValid(regexTestResult);

    // Explain Error
    if (!regexTestResult)
      setError(
        "Please enter your full name consisting of 3 to 20 characters, using letters and spaces."
      );
  };

  const handleSignUpButton = async () => {
    if (
      !isEmailValid ||
      !isPasswordValid ||
      !isUsernameValid ||
      !isFullnameValid ||
      !referralCode
    ) {
      return;
    }

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

    const fetchUrl = `${userPanelBaseUrl}/api/user/authentication/signup/verificationCodeSend`;

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
        }),
      });

      if (!response.ok) {
        const errorResponse =
          (await response.json()) as VerificationCodeSendApiErrorResponseBody;

        console.error(
          "Response from ",
          fetchUrl,
          " is not okay: ",
          errorResponse
        );

        const cause = errorResponse.cause;
        const message = errorResponse.message;

        setError(message);

        if (cause === "email") {
          setIsEmailValid(false);
        } else if (cause === "fullname") {
          setIsFullnameValid(false);
        } else if (cause === "password") {
          setIsPasswordValid(false);
        } else if (cause === "username") {
          setIsUsernameValid(false);
        } else if (cause === "referralCode") {
          router.back();
        } else if (cause === "server") {
          // We need to make something for here.
        }
      }
      router.push(
        `/auth/signup/verification?email=${email}&password=${password}&username=${username}&fullname=${fullname}&referralCode=${referralCode}`
      );
      // Verification Code Sent.. Go to verification page.
      return true;
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
      <View style={styles.container}>
        <Image
          style={styles.logoImage}
          source={require("@/assets/images/logo.png")}
        />
        <Text style={styles.join}>Join Apidon</Text>
        <Text style={styles.continueText}>
          To finish sign up, please enter your email, password, username and
          fullname.
        </Text>

        <TextInput
          style={{
            ...styles.input,
            borderColor: isEmailValid ? "white" : "red",
          }}
          placeholder="Email"
          placeholderTextColor="#808080"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={handleEmailChange}
        />
        <TextInput
          style={{
            ...styles.input,
            borderColor: isPasswordValid ? "white" : "red",
          }}
          placeholder="Password"
          placeholderTextColor="#808080"
          autoCapitalize="none"
          secureTextEntry={true}
          value={password}
          onChangeText={handlePasswordChange}
        />
        {!isPasswordValid && (
          <View
            style={{
              width: "100%",
              gap: 5,
            }}
          >
            {!passwordStatus.digit && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  paddingHorizontal: 20,
                }}
              >
                <MaterialIcons name="error-outline" color="red" size={20} />
                <Text style={{ fontSize: 15, color: "red" }}>
                  Numbers (0-9)
                </Text>
              </View>
            )}
            {!passwordStatus.lowercase && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  paddingHorizontal: 20,
                }}
              >
                <MaterialIcons name="error-outline" color="red" size={20} />
                <Text style={{ fontSize: 15, color: "red" }}>
                  Lower case letters (aa)
                </Text>
              </View>
            )}

            {!passwordStatus.uppercase && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  paddingHorizontal: 20,
                }}
              >
                <MaterialIcons name="error-outline" color="red" size={20} />
                <Text style={{ fontSize: 15, color: "red" }}>
                  Upper case letters (AA)
                </Text>
              </View>
            )}

            {!passwordStatus.special && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  paddingHorizontal: 20,
                }}
              >
                <MaterialIcons name="error-outline" color="red" size={20} />
                <Text style={{ fontSize: 15, color: "red" }}>
                  Special characters (&*%)
                </Text>
              </View>
            )}

            {!passwordStatus.eightCharacter && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  paddingHorizontal: 20,
                }}
              >
                <MaterialIcons name="error-outline" color="red" size={20} />
                <Text style={{ fontSize: 15, color: "red" }}>
                  At least 12 characters
                </Text>
              </View>
            )}
          </View>
        )}

        <TextInput
          style={{
            ...styles.input,
            borderColor: isUsernameValid ? "white" : "red",
          }}
          placeholder="Username"
          placeholderTextColor="#808080"
          autoCapitalize="none"
          keyboardType="default"
          value={username}
          onChangeText={handleUsernameChange}
        />
        <TextInput
          style={{
            ...styles.input,
            borderColor: isFullnameValid ? "white" : "red",
          }}
          placeholder="Fullname"
          placeholderTextColor="#808080"
          keyboardType="default"
          value={fullname}
          onChangeText={handleFullnameChange}
        />

        <Text style={styles.error}>{error}</Text>

        <Pressable style={styles.signUpButton} onPress={handleSignUpButton}>
          <Text
            style={{ color: "white", textAlign: "center", fontWeight: "bold" }}
          >
            Sign Up
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    padding: 15,
  },
  logoImage: {
    height: "12%",
    aspectRatio: 1,
  },
  join: {
    color: "white",
    fontSize: 25,
    textAlign: "center",
    fontWeight: "bold",
  },
  continueText: {
    color: "#718096",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    height: 45,
    color: "white",
    backgroundColor: "black",
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 10,
    padding: 10,
  },
  signUpButton: {
    width: "50%",
    backgroundColor: "black",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#d53f8cd9",
  },
  error: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
  },
});

export default secondPhase;
