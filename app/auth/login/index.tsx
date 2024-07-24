import apiRoutes from "@/helpers/ApiRoutes";
import { CheckThereIsLinkedAccountApiResponseBody } from "@/types/ApiResponses";
import { Link, router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Keyboard,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import appCheck from "@react-native-firebase/app-check";

import {
  appleAuth,
  AppleButton,
} from "@invertase/react-native-apple-authentication";

import {
  GoogleSignin,
  GoogleSigninButton,
} from "@react-native-google-signin/google-signin";

import auth from "@react-native-firebase/auth";

const index = () => {
  const [emailUsername, setEmailUsername] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("regex");

  const opacity = useRef(new Animated.Value(1)).current;

  const containerRef = useRef<null | View>(null);
  const screenHeight = Dimensions.get("window").height;
  const animatedTranslateValue = useRef(new Animated.Value(0)).current;

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
  }, []);

  useEffect(() => {
    if (error.length > 0) {
      changeOpacity(0.5);
    } else {
      changeOpacity(1);
    }
  }, [error]);

  useEffect(() => {
    if (loading) {
      changeOpacity(0.5);
    } else {
      changeOpacity(1);
    }
  }, [loading]);

  const changeOpacity = (toValue: number) => {
    Animated.timing(opacity, {
      toValue: toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleLoginButton = async () => {
    if (loading) return;

    setLoading(true);
    Keyboard.dismiss();

    const userDataResult = await handleGetUserData(emailUsername);

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
    const lowercasedInput = input.toLowerCase().trim();

    setEmailUsername(lowercasedInput);
    setError("");

    const emailRegex =
      /^[A-Za-z0-9._%+-]+@(gmail|yahoo|outlook|aol|icloud|protonmail|yandex|mail|zoho)\.(com|net|org)$/i;
    const emailRegexTestResult = emailRegex.test(lowercasedInput);

    const usernameRegex = /^[a-z0-9]{4,20}$/;
    const usernameRegexTestResult = usernameRegex.test(lowercasedInput);

    if (!(emailRegexTestResult || usernameRegexTestResult)) {
      setError("regex");
    }
  };

  const handleGetUserData = async (emailOrUsername: string) => {
    setError("");

    try {
      const { token: appchecktoken } = await appCheck().getLimitedUseToken();

      const response = await fetch(
        apiRoutes.user.authentication.login.checkThereIsLinkedAccount,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            appchecktoken,
          },
          body: JSON.stringify({
            eu: emailOrUsername,
          }),
        }
      );

      if (!response.ok) {
        const message = await response.text();

        console.error(
          "Response from ",
          apiRoutes.user.authentication.login.checkThereIsLinkedAccount,
          " is not okay: ",
          message
        );

        setError(message);

        return false;
      }

      const result =
        (await response.json()) as CheckThereIsLinkedAccountApiResponseBody;

      const emailFetched = result.email;
      const usernameFetched = result.username;

      if (!emailFetched || !usernameFetched) {
        setError("No user found with the provided email or username.");
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

  const handleAppleSignInButton = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      if (!appleAuthRequestResponse.identityToken) {
        setLoading(false);
        console.error("No identity token found in the response");
        return setError("No identity token found");
      }

      const { identityToken, nonce } = appleAuthRequestResponse;

      const appleCredential = auth.AppleAuthProvider.credential(
        identityToken,
        nonce
      );

      await auth().signInWithCredential(appleCredential);

      return setLoading(false);
    } catch (error) {
      setLoading(false);
      return console.error("Error on Apple Sign In: ", error);
    }
  };

  async function handleGoogleSignInButton() {
    setLoading(true);

    try {
      GoogleSignin.configure({
        webClientId: "",
      });

      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      // Get the users ID token
      const { idToken } = await GoogleSignin.signIn();

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      await auth().signInWithCredential(googleCredential);

      return setLoading(false);
    } catch (error) {
      setLoading(false);
      return console.error("Error on Google Sign In: ", error);
    }
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
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
            ...styles.container,
            transform: [{ translateY: animatedTranslateValue }],
          }}
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
            onSubmitEditing={handleLoginButton}
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
                <ActivityIndicator color="white" size={16} />
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

          <View id="apple-sign-in">
            <AppleButton
              buttonStyle={AppleButton.Style.BLACK}
              buttonType={AppleButton.Type.CONTINUE}
              onPress={handleAppleSignInButton}
              style={{
                width: 160,
                height: 45,
                borderWidth: 1,
                borderColor: "white",
                borderRadius: 10,
              }}
            />
          </View>
          <View id="google-sign-in">
            <GoogleSigninButton
              size={GoogleSigninButton.Size.Icon}
              color={GoogleSigninButton.Color.Light}
              onPress={handleGoogleSignInButton}
            />
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    gap: 20,
  },
  logoImage: {
    height: "20%",
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
