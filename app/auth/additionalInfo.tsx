import { Text } from "@/components/Text/Text";
import apiRoutes from "@/helpers/ApiRoutes";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Keyboard,
  Pressable,
  TextInput,
  View,
} from "react-native";

import { Entypo, Ionicons } from "@expo/vector-icons";
import appleAuth from "@invertase/react-native-apple-authentication";
import appCheck from "@react-native-firebase/app-check";
import auth from "@react-native-firebase/auth";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/providers/AuthProvider";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

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
  const animatedTranslateValue = useRef(new Animated.Value(0)).current;

  const errorOpacity = useRef(new Animated.Value(1)).current;
  const buttonOpactiy = useRef(new Animated.Value(1)).current;

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
    const keyboardWillShowListener = Keyboard.addListener(
      "keyboardWillShow",
      (event) => {
        if (Keyboard.isVisible()) return;

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

              Animated.timing(animatedTranslateValue, {
                toValue: -toValue,
                duration: 250,
                useNativeDriver: true,
              }).start();
            }
          );
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

  const changeErrorOpacity = (toValue: number) => {
    Animated.timing(errorOpacity, {
      toValue: toValue,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const changeButtonOpacity = (toValue: number) => {
    Animated.timing(buttonOpactiy, {
      toValue: toValue,
      duration: 400,
      useNativeDriver: true,
    }).start();
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

      return router.replace("/initialProvider");

      // Good to go...
    } catch (error) {
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

      if (isApple) {
        const { authorizationCode, identityToken, nonce } =
          await appleAuth.performRequest({
            requestedOperation: appleAuth.Operation.REFRESH,
          });

        if (!authorizationCode) {
          console.error("No authorization code found to revoke apple user.");
          return setDeleteAccountLoading(false);
        }

        const appleCredential = auth.AppleAuthProvider.credential(
          identityToken,
          nonce
        );

        await currentUserAuthObject.reauthenticateWithCredential(
          appleCredential
        );

        await auth().revokeToken(authorizationCode);
      }

      if (isGoogle) {
        GoogleSignin.configure({
          webClientId: "",
        });

        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });

        const { idToken } = await GoogleSignin.signIn();

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
      setAuthStatus("dontMess");
      console.error("Error on deleting account: ", error);
      setDeleteAccountLoading(false);
    }
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
