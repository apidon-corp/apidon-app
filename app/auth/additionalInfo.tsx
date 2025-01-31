import { Text } from "@/components/Text/Text";
import apiRoutes from "@/helpers/ApiRoutes";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";

import { Entypo, Ionicons } from "@expo/vector-icons";
import * as AppleAuthentication from "expo-apple-authentication";
import appCheck from "@react-native-firebase/app-check";
import auth from "@react-native-firebase/auth";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/providers/AuthProvider";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import crashlytics from "@react-native-firebase/crashlytics";

import { appleAuthAndroid } from "@invertase/react-native-apple-authentication";
import { v4 as uuid } from "uuid";
import "react-native-get-random-values";

import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
import { storeData } from "@/helpers/Storage";

const additionalInfo = () => {
  const { setAuthStatus } = useAuth();

  const [username, setUsername] = useState("");
  const [isUsernameValid, setIsUsernameValid] = useState(false);

  const [fullname, setFullname] = useState("");
  const [isFullnameValid, setIsFullnameValid] = useState(false);

  const [loading, setLoading] = useState(false);
  const [checkUsernameLoading, setCheckUsernameLoading] = useState(false);

  const [buttonActiveStatus, setButtonActiveStatus] = useState(false);

  const [usernameError, setUsernameError] = useState("");
  const [fullnameError, setFullnameError] = useState("");

  const [error, setError] = useState("");

  const { bottom } = useSafeAreaInsets();

  const bodyContainerRef = useRef<null | View>(null);
  const containerRef = useRef<null | View>(null);
  const screenHeight = Dimensions.get("window").height;

  const translateValue = useSharedValue(0);
  const errorOpacity = useSharedValue(0);
  const buttonOpactiy = useSharedValue(1);

  const timeout = useRef<NodeJS.Timeout | null>(null);

  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);

  // Error Handling
  useEffect(() => {
    if (usernameError && username.length > 0) return setError(usernameError);
    if (fullnameError && fullname.length > 0) return setError(fullnameError);
    return setError("");
  }, [username, usernameError, fullname, fullnameError]);

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
      isUsernameValid &&
      isFullnameValid &&
      !loading &&
      !checkUsernameLoading &&
      !deleteAccountLoading;

    setButtonActiveStatus(buttonActiveStatusDetermined);
  }, [
    isUsernameValid,
    isFullnameValid,
    checkUsernameLoading,
    loading,
    deleteAccountLoading,
  ]);

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

              translateValue.value = withTiming(-toValue, { duration: 250 });
            }
          );
        }
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      isIOS ? "keyboardWillHide" : "keyboardDidHide",
      (event) => {
        translateValue.value = withTiming(0, { duration: 250 });
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const changeErrorOpacity = (toValue: number) => {
    errorOpacity.value = withTiming(toValue, { duration: 400 });
  };

  const changeButtonOpacity = (toValue: number) => {
    buttonOpactiy.value = withTiming(toValue, { duration: 400 });
  };

  const handleUsernameChange = async (input: string) => {
    setCheckUsernameLoading(true);

    setUsernameError("");

    // Transform input
    input = input
      .toLowerCase()
      .trimEnd()
      .replace(/[^\w\s]$/, "");

    setUsername(input);

    const usernameRegex = /^[a-z0-9]{4,20}$/;
    const isValid = usernameRegex.test(input);
    setIsUsernameValid(isValid);

    if (!isValid) {
      setUsernameError(
        "Please enter a username consisting of 4 to 20 characters, using only lowercase letters (a-z) and digits (0-9)."
      );
      setCheckUsernameLoading(false);
      return false;
    }

    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    timeout.current = setTimeout(async () => {
      const canUse = await checkUsernameCanBeUsed(input);
      if (!canUse) {
        setIsUsernameValid(false);
        setUsernameError("This username is already taken.");
      } else {
        setIsUsernameValid(true);
        setUsernameError("");
      }
      setCheckUsernameLoading(false);
    }, 2000);
  };

  const checkUsernameCanBeUsed = async (username: string) => {
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
          body: JSON.stringify({ eu: username }),
        }
      );

      if (!response.ok) {
        console.error(
          "Response from ",
          apiRoutes.user.authentication.login.checkThereIsLinkedAccount,
          " is not okay: ",
          await response.text()
        );
        return false;
      }

      const { username: usernameFetched, email } = await response.json();

      if (!usernameFetched && !email) return true;

      return false;
    } catch (error) {
      console.error(
        "Error on fetching to checkThereIsLinkedAccount API from apidon-user side: ",
        error
      );
      return false;
    }
  };

  const handleFullnameChange = (input: string) => {
    setFullnameError("");
    input = input.replace(/[^\p{L}\p{N}\s]/gu, "");
    setFullname(input);

    const fullnameRegex = /^\p{L}{1,20}(?: \p{L}{1,20})*$/u;
    const regexTestResult = fullnameRegex.test(input);

    setIsFullnameValid(regexTestResult);

    // Explain Error
    if (!regexTestResult)
      setFullnameError(
        "Please enter your full name consisting of 3 to 20 characters, using letters and spaces."
      );
  };

  const handleContinueButton = async () => {
    if (loading) return;
    if (!buttonActiveStatus) return;

    setLoading(true);

    const currentUserAuthObject = auth().currentUser;

    if (!currentUserAuthObject) {
      console.error("User not logged in.");
      setError("You are not logged in.");
      return setLoading(false);
    }

    const usernameAvaliable = await checkUsernameCanBeUsed(username);
    if (!usernameAvaliable) return setLoading(false);

    setError("");

    try {
      const idToken = await currentUserAuthObject.getIdToken();
      const { token: appchecktoken } = await appCheck().getLimitedUseToken();

      const response = await fetch(
        apiRoutes.user.authentication.signup.completeSignUp,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${idToken}`,
            appchecktoken,
          },
          body: JSON.stringify({
            username: username,
            fullname: fullname,
          }),
        }
      );

      if (!response.ok) {
        const errorFromApi = await response.text();

        console.log("Response from route is not okay: ", errorFromApi);
        setError(errorFromApi);
        setLoading(false);
        return;
      }

      const isValidAuthObject = (
        await currentUserAuthObject.getIdTokenResult(true)
      ).claims.isValidAuthObject;

      if (!isValidAuthObject) {
        console.error(
          "User's auth object is not valid after successfull sign-up operation..."
        );
        setError("Internal Server Error");
        return setLoading(false);
      }

      await currentUserAuthObject.reload();

      setLoading(false);

      setAuthStatus("authenticated");

      await setHasValidObjectBeforeDevice(username);

      return router.replace("/home/feed");

      // Good to go...
    } catch (error) {
      crashlytics().recordError(
        new Error(
          `Error on completing additional information. (screen: Additional Info- Continue Button): \n: ${error}`
        )
      );
      console.error(
        "Error on fetching to route API from apidon-user side: ",
        error
      );
      setError("Internal Server Error");
      setLoading(false);
    }
  };

  const handleDeleteAccountButton = () => {
    if (loading) return;
    if (deleteAccountLoading) return;

    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDeleteAccount(),
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    if (loading || deleteAccountLoading) return;

    setDeleteAccountLoading(true);

    try {
      const currentUserAuthObject = auth().currentUser;
      if (!currentUserAuthObject) {
        console.error("No current user found to delete");
        return setDeleteAccountLoading(false);
      }

      const providerData = currentUserAuthObject.providerData;
      const providerId = providerData[0].providerId;

      const isApple = providerId === "apple.com";
      const isGoogle = providerId === "google.com";
      const isPassword = providerId === "password";

      const isIOS = Platform.OS === "ios";

      if (isApple) {
        if (isIOS) {
          const { authorizationCode, identityToken } =
            await AppleAuthentication.refreshAsync({
              user: currentUserAuthObject.uid,
            });

          if (!authorizationCode) {
            console.error("No authorization code found to revoke apple user.");
            return setDeleteAccountLoading(false);
          }

          const appleCredential =
            auth.AppleAuthProvider.credential(identityToken);

          await currentUserAuthObject.reauthenticateWithCredential(
            appleCredential
          );

          await auth().revokeToken(authorizationCode);
        } else {
          const rawNonce = uuid();
          const state = uuid();

          // Configure the request
          appleAuthAndroid.configure({
            // The Service ID you registered with Apple
            clientId:
              process.env.EXPO_PUBLIC_APPLE_AUTH_ANDROID_CLIENT_KEY || "",

            // Return URL added to your Apple dev console. We intercept this redirect, but it must still match
            // the URL you provided to Apple. It can be an empty route on your backend as it's never called.
            redirectUri: process.env.EXPO_PUBLIC_APPLE_AUTH_REDIRECT_URI || "",

            // The type of response requested - code, id_token, or both.
            responseType: appleAuthAndroid.ResponseType.ALL,

            // The amount of user information requested from Apple.
            scope: appleAuthAndroid.Scope.ALL,

            // Random nonce value that will be SHA256 hashed before sending to Apple.
            nonce: rawNonce,

            // Unique state value used to prevent CSRF attacks. A UUID will be generated if nothing is provided.
            state,
          });

          const {
            id_token: identityToken,
            nonce,
            code: authenticationCode,
          } = await appleAuthAndroid.signIn();

          if (!identityToken || !nonce) {
            setLoading(false);
            return console.error(
              "No identity token or nonce found in the response"
            );
          }

          const appleCredential = auth.AppleAuthProvider.credential(
            identityToken,
            nonce
          );

          await currentUserAuthObject.reauthenticateWithCredential(
            appleCredential
          );

          await auth().revokeToken(authenticationCode);
        }
      }

      if (isGoogle) {
        GoogleSignin.configure({
          webClientId:
            process.env.EXPO_PUBLIC_GOOGLE_AUTH_ANDROID_WEB_CLIENT_KEY,
        });

        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });

        const data = (await GoogleSignin.signIn()).data;

        if (!data) {
          console.error("No data found to revoke google user.");
          return setDeleteAccountLoading(false);
        }

        const idToken = data.idToken;
        if (!idToken) {
          console.error("No idToken found to revoke google user.");
          return setDeleteAccountLoading(false);
        }

        const googleCredential = auth.GoogleAuthProvider.credential(idToken);

        await currentUserAuthObject.reauthenticateWithCredential(
          googleCredential
        );
      }

      if (isPassword) {
        setDeleteAccountLoading(false);
        return router.push("/auth/passwordDeleteAccount");
      }

      await currentUserAuthObject.delete();

      if (router.canGoBack()) {
        router.back();
      }

      return setDeleteAccountLoading(false);
    } catch (error) {
      crashlytics().recordError(
        new Error(`Error on deleting account: \n: ${error}`)
      );
      setAuthStatus("dontMess");
      console.error("Error on deleting account: ", error);
      setDeleteAccountLoading(false);
    }
  };

  const setHasValidObjectBeforeDevice = async (displayName: string) => {
    await storeData(displayName, "true");
    return true;
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
        style={{
          position: "relative",
          flex: 1,
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          transform: [{ translateY: translateValue }],
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
            Set Your Account
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
            <View id="username" style={{ gap: 10 }}>
              <Text bold>Username</Text>
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
                    style={[
                      {
                        width: "100%",
                        height: 45,
                        color: "white",
                        padding: 10,
                      },
                      {
                        borderColor:
                          isUsernameValid || username.length === 0
                            ? "white"
                            : "red",
                      },
                    ]}
                    placeholder="Username"
                    placeholderTextColor="#808080"
                    autoCapitalize="none"
                    keyboardType="default"
                    value={username}
                    onChangeText={handleUsernameChange}
                  />
                </View>

                <View
                  id="indicator"
                  style={{
                    position: "absolute",
                    right: 10,
                  }}
                >
                  {checkUsernameLoading ? (
                    <ActivityIndicator color="white" />
                  ) : username.length === 0 ? (
                    <></>
                  ) : isUsernameValid ? (
                    <Ionicons name="checkmark-circle" size={24} color="green" />
                  ) : (
                    <Entypo name="circle-with-cross" size={24} color="red" />
                  )}
                </View>
              </View>
            </View>
            <View id="fullname" style={{ gap: 10 }}>
              <Text bold>Fullname</Text>
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
                    placeholder="Fullname"
                    placeholderTextColor="#808080"
                    keyboardType="default"
                    value={fullname}
                    onChangeText={handleFullnameChange}
                  />
                </View>

                <View
                  id="indicator"
                  style={{
                    position: "absolute",
                    right: 10,
                  }}
                >
                  {fullname.length === 0 ? (
                    <></>
                  ) : isFullnameValid ? (
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

        <View
          style={{
            position: "absolute",
            bottom: bottom,
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <Pressable
            onPress={handleDeleteAccountButton}
            disabled={loading || deleteAccountLoading}
            style={{
              width: 100,
              padding: 10,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "gray",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {deleteAccountLoading ? (
              <ActivityIndicator color="gray" size={10} />
            ) : (
              <Text fontSize={10}>Delete Account</Text>
            )}
          </Pressable>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

export default additionalInfo;
