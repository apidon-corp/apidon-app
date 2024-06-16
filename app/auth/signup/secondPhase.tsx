import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Animated,
  Dimensions,
  Keyboard,
  ActivityIndicator,
  TurboModuleRegistry,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";

import { MaterialIcons } from "@expo/vector-icons";
import {
  CheckThereIsLinkedAccountApiResponseBody,
  VerificationCodeSendApiErrorResponseBody,
} from "@/types/ApiResponses";
import { router, useLocalSearchParams } from "expo-router";
import { apidonPink } from "@/constants/Colors";

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

  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [isFullnameValid, setIsFullnameValid] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const usernameRef = useRef<TextInput>(null);
  const fullnameRef = useRef<TextInput>(null);

  const [passwordStatus, setPasswordStatus] = useState({
    digit: false,
    lowercase: false,
    uppercase: false,
    eightCharacter: false,
    special: false,
  });

  const containerRef = useRef<null | View>(null);
  const screenHeight = Dimensions.get("window").height;
  const animatedTranslateValue = useRef(new Animated.Value(0)).current;

  const animatedOpacityValue = useRef(new Animated.Value(1)).current;

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
              toValue += 20;
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

  useEffect(() => {
    const status =
      isEmailValid && isPasswordValid && isUsernameValid && isFullnameValid;

    Animated.timing(animatedOpacityValue, {
      toValue: status ? 1 : 0.5,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isEmailValid, isPasswordValid, isUsernameValid, isFullnameValid]);

  const handleEmailChange = (input: string) => {
    setError("");
    setEmail(input);
    const emailRegex =
      /^[A-Za-z0-9._%+-]+@(gmail|yahoo|outlook|aol|icloud|protonmail|yandex|mail|zoho)\.(com|net|org)$/i;
    const regexTestResult = emailRegex.test(input);
    setIsEmailValid(regexTestResult);
  };

  const handlePasswordChange = async (input: string) => {
    setPassword(input);

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

    const usernameRegex = /^[a-z0-9]{4,20}$/;
    const regexTestResult = usernameRegex.test(input);

    setIsUsernameValid(regexTestResult);

    // Explain Error
    if (!regexTestResult)
      return setError(
        "Please enter a username consisting of 4 to 20 characters, using only lowercase letters (a-z) and digits (0-9)."
      );

    checkUsernameCanBeUsed(input);
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
        console.log(
          "Response from ",
          fetchUrl,
          " is not okay: ",
          await response.text()
        );

        setError("");
        setIsUsernameValid(true);

        return false;
      }

      setError("Username is used.");
      setIsUsernameValid(false);

      return true;
    } catch (error) {
      console.error(
        "Error on fetching to checkThereIsLinkedAccount API from apidon-user side: ",
        error
      );
      setError("Internal Server Error");
      setIsUsernameValid(false);
      return false;
    }
  };

  const handleFullnameChange = (input: string) => {
    setError("");
    input = input.replace(/[^\p{L}\p{N}\s]/gu, "");
    setFullname(input);

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
    const status =
      isEmailValid &&
      isPasswordValid &&
      isUsernameValid &&
      isFullnameValid &&
      referralCode !== undefined;

    if (!status) return;

    if (loading) return;

    setLoading(true);

    await handleSignUp();

    setLoading(false);
  };

  const handleSignUp = async () => {
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

        return false;
      }

      const encodedEmail = encodeURI(email);
      const encodedPassword = encodeURI(password);
      const encodedUsername = encodeURI(username);
      const encodedFullname = encodeURI(fullname);
      const encodedReferralCode = encodeURI(referralCode as string);

      router.push(
        `/auth/signup/verification?email=${encodedEmail}&password=${encodedPassword}&username=${encodedUsername}&fullname=${encodedFullname}&referralCode=${encodedReferralCode}`
      );

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
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          justifyContent: "center",
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={{
            ...styles.container,
            transform: [{ translateY: animatedTranslateValue }],
          }}
          ref={containerRef}
        >
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
            ref={emailRef}
            style={{
              ...styles.input,
              borderColor: isEmailValid || email.length === 0 ? "white" : "red",
            }}
            placeholder="Email"
            placeholderTextColor="#808080"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={handleEmailChange}
            onSubmitEditing={() => {
              passwordRef.current?.focus();
            }}
            autoFocus
          />
          <TextInput
            ref={passwordRef}
            style={{
              ...styles.input,
              borderColor:
                isPasswordValid || password.length === 0 ? "white" : "red",
            }}
            placeholder="Password"
            placeholderTextColor="#808080"
            autoCapitalize="none"
            secureTextEntry={true}
            value={password}
            onChangeText={handlePasswordChange}
            onSubmitEditing={() => {
              usernameRef.current?.focus();
            }}
          />
          {!isPasswordValid && password.length !== 0 && (
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
            ref={usernameRef}
            style={{
              ...styles.input,
              borderColor:
                isUsernameValid || username.length === 0 ? "white" : "red",
            }}
            placeholder="Username"
            placeholderTextColor="#808080"
            autoCapitalize="none"
            keyboardType="default"
            value={username}
            onChangeText={handleUsernameChange}
            onSubmitEditing={() => {
              fullnameRef.current?.focus();
            }}
          />
          <TextInput
            ref={fullnameRef}
            style={{
              ...styles.input,
              borderColor:
                isFullnameValid || fullname.length === 0 ? "white" : "red",
            }}
            placeholder="Fullname"
            placeholderTextColor="#808080"
            keyboardType="default"
            value={fullname}
            onChangeText={handleFullnameChange}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <Animated.View
            style={{
              width: "100%",
              opacity: animatedOpacityValue,
            }}
          >
            <Pressable style={styles.signUpButton} onPress={handleSignUpButton}>
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
                  Sign Up
                </Text>
              )}
            </Pressable>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    padding: 15,
  },
  logoImage: {
    height: "20%",
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
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: apidonPink,
    borderRadius: 10,
  },
  error: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
  },
});

export default secondPhase;
