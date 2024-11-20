import {
  View,
  ScrollView,
  Animated,
  TextInput,
  Text as NativeText,
  Pressable,
  Dimensions,
  Keyboard,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Text from "@/components/Text/Text";

import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";

import * as AppleAuthentication from "expo-apple-authentication";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import appCheck from "@react-native-firebase/app-check";
import apiRoutes from "@/helpers/ApiRoutes";
import { router } from "expo-router";

const deleteAccount = () => {
  const [confirmText, setConfirmText] = useState("");
  const [readyToDelete, setReadyToDelete] = useState(false);

  const animatedButtonValue = useRef(new Animated.Value(0.5)).current;

  const bodyContainerRef = useRef<null | View>(null);
  const screenHeight = Dimensions.get("window").height;
  const animatedTranslateValue = useRef(new Animated.Value(0)).current;

  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");

  const handleDeleteMyAccountButton = async () => {
    if (deleting) return;

    setDeleting(true);

    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) {
      console.error("No user is currently logged in.");
      return setDeleting(false);
    }

    const providerData = currentUserAuthObject.providerData;
    const providerId = providerData[0].providerId;

    const isApple = providerId === "apple.com";
    const isGoogle = providerId === "google.com";
    const isPassword = providerId === "password";

    // Revoking Apple Token and Reload Auth Token
    if (isApple) {
      const { authorizationCode, identityToken } =
        await AppleAuthentication.refreshAsync({
          user: currentUserAuthObject.uid,
        });

      if (!authorizationCode) {
        console.error("No authorization code found to revoke apple user.");
        return setDeleting(false);
      }

      const appleCredential = auth.AppleAuthProvider.credential(identityToken);

      try {
        await currentUserAuthObject.reauthenticateWithCredential(
          appleCredential
        );
      } catch (error) {
        console.error("Error on re-authenticating with apple: ", error);
        return setDeleting(false);
      }

      try {
        await auth().revokeToken(authorizationCode);
      } catch (error) {
        console.error("Error on revoking apple token: ", error);
        return setDeleting(false);
      }
    }

    // Reload Auth Token
    if (isGoogle) {
      GoogleSignin.configure({
        webClientId: "",
      });

      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const data = (await GoogleSignin.signIn()).data;

      if (!data) {
        console.error("No data found to revoke google user.");
        return setDeleting(false);
      }

      const idToken = data.idToken;
      if (!idToken) {
        console.error("No idToken found to revoke google user.");
        return setDeleting(false);
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      try {
        await currentUserAuthObject.reauthenticateWithCredential(
          googleCredential
        );
      } catch (error) {
        console.error("Error on re-authenticating with google: ", error);
        return setDeleting(false);
      }
    }

    if (isPassword)
      return handlePasswordTypeAccountDeletion(currentUserAuthObject);

    const requestResult = await sendDeletionRequestToBackend();
    if (!requestResult) return setDeleting(false);

    await auth().signOut();

    router.replace("/auth/welcome");

    setDeleting(false);
  };

  const handlePasswordTypeAccountDeletion = async (
    currentUserAuthObject: FirebaseAuthTypes.User
  ) => {
    // Getting Password from user.
    Alert.prompt(
      "Enter your password",
      "Please enter your password to confirm account deletion.",
      [
        {
          text: "Cancel",
          onPress: () => {
            setDeleting(false);
          },
          style: "cancel",
        },
        {
          text: "OK",
          onPress: (text) => {
            handleFinishEmailTypeAccountDeletion(
              text || "",
              currentUserAuthObject
            );
          },
        },
      ],
      "secure-text"
    );
  };

  const handleFinishEmailTypeAccountDeletion = async (
    password: string,
    currentUserAuthObject: FirebaseAuthTypes.User
  ) => {
    if (!password) return setDeleting(false);

    const email = currentUserAuthObject.email || "";
    if (!email) {
      console.error("No email found to delete account.");
      return setDeleting(false);
    }

    const passwordCredential = auth.EmailAuthProvider.credential(
      email,
      password
    );

    try {
      await currentUserAuthObject.reauthenticateWithCredential(
        passwordCredential
      );
    } catch (error) {
      console.error("Error on re-authenticating with password: ", error);
      setError("Invalid Password");
      return setDeleting(false);
    }

    const requestResult = await sendDeletionRequestToBackend();
    if (!requestResult) return setDeleting(false);

    await auth().signOut();

    router.replace("/auth/welcome");

    setDeleting(false);
  };

  const sendDeletionRequestToBackend = async () => {
    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return false;

    try {
      const idToken = await currentUserAuthObject.getIdToken();
      const { token: appchecktoken } = await appCheck().getLimitedUseToken();

      const response = await fetch(apiRoutes.user.personal.deleteAccount, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
          appchecktoken,
        },
      });

      if (!response.ok) {
        console.error(
          "Response from delete account API is not okay: ",
          await response.text()
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error on deleting account: ", error);
      return false;
    }
  };

  useEffect(() => {
    const displayName = auth().currentUser?.displayName;
    if (!displayName) return;

    setReadyToDelete(confirmText === `Delete my account @${displayName}`);
  }, [confirmText]);

  // Change opacity of button.
  useEffect(() => {
    const status = readyToDelete && !deleting;

    if (status) {
      Animated.timing(animatedButtonValue, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animatedButtonValue, {
        toValue: 0.5,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [readyToDelete, deleting]);

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

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
      }}
    >
      <Animated.View
        ref={bodyContainerRef}
        style={{
          transform: [
            {
              translateY: animatedTranslateValue,
            },
          ],
        }}
      >
        <View
          style={{
            gap: 15,
          }}
        >
          <Text fontSize={16} bold>
            Are you sure you want to delete your account?
          </Text>
          <Text fontSize={12}>
            Deleting your account is permanent and cannot be undone. You will
            lose access to all your data, including your event collectibles and
            profile information.
          </Text>
          <View
            style={{
              width: "100%",
              gap: 3,
            }}
          >
            <NativeText
              style={{
                color: "gray",
                fontSize: 12,
              }}
            >
              Please type{" '"}
              <NativeText
                style={{
                  color: "red",
                  fontSize: 12,
                }}
              >
                Delete my account @{auth().currentUser?.displayName}
              </NativeText>
              {"' below to confirm."}
            </NativeText>
            <TextInput
              value={confirmText}
              onChangeText={setConfirmText}
              style={{
                borderWidth: 1,
                borderColor: "gray",
                borderRadius: 10,
                padding: 10,
                marginTop: 10,
                color: "white",
              }}
            />
          </View>

          <Animated.View
            style={{
              opacity: animatedButtonValue,
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Pressable
              onPress={handleDeleteMyAccountButton}
              style={{
                backgroundColor: "red",
                padding: 8,
                borderRadius: 10,
                width: "75%",
                alignItems: "center",
                marginTop: 10,
              }}
            >
              {deleting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  style={{
                    color: "white",
                    fontSize: 14,
                  }}
                >
                  Delete My Account
                </Text>
              )}
            </Pressable>
          </Animated.View>

          {error && (
            <Text
              style={{
                color: "red",
                textAlign: "center",
              }}
              fontSize={12}
            >
              {error}
            </Text>
          )}
        </View>
      </Animated.View>
    </ScrollView>
  );
};

export default deleteAccount;
