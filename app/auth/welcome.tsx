import { Text } from "@/components/Text/Text";
import { AntDesign, Fontisto, Ionicons } from "@expo/vector-icons";
import * as AppleAuthentication from "expo-apple-authentication";
import { Text as NativeText, Platform } from "react-native";

import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, SafeAreaView, View } from "react-native";

import { useAuth } from "@/providers/AuthProvider";
import auth from "@react-native-firebase/auth";
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { Image } from "expo-image";
import { router } from "expo-router";

import "react-native-get-random-values";
import crashlytics from "@react-native-firebase/crashlytics";

import * as Linking from "expo-linking";

import { v4 as uuid } from "uuid";

import { appleAuthAndroid } from "@invertase/react-native-apple-authentication";

const welcome = () => {
  const { setAuthStatus } = useAuth();

  const [loading, setLoading] = useState(false);

  const opacity = useRef(new Animated.Value(1)).current;

  const [termsAccepted, setTermsAccepted] = useState(false);

  const translateX = useRef(new Animated.Value(0)).current;

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

  const handleAcceptEulaButton = () => {
    setTermsAccepted((prev) => !prev);
  };

  async function handleContinueWithAppleButton() {
    if (!termsAccepted) return startBounceAnimation();

    if (loading) return;

    setLoading(true);

    try {
      if (auth().currentUser) await auth().signOut();

      setAuthStatus("dontMess");

      const appleAuthRequestResponse = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!appleAuthRequestResponse.identityToken) {
        setLoading(false);
        return console.error("No identity token found in the response");
      }

      const { identityToken } = appleAuthRequestResponse;

      const appleCredential = auth.AppleAuthProvider.credential(identityToken);

      const user = (await auth().signInWithCredential(appleCredential)).user;

      const idTokenResult = await user.getIdTokenResult(true);

      const isValidAuthObject = idTokenResult.claims.isValidAuthObject;

      if (!isValidAuthObject) {
        setLoading(false);
        return router.push("/auth/additionalInfo");
      }

      // We are setting this manually due to dontMess state...
      setAuthStatus("authenticated");

      router.replace("/home");

      return setLoading(false);
    } catch (error: any) {
      if (error.code === "ERR_REQUEST_CANCELED") {
        setAuthStatus("unauthenticated");
        return setLoading(false);
      }

      setAuthStatus("unauthenticated");
      setLoading(false);
      crashlytics().recordError(
        new Error(`Error on Apple Sign In at welcome screen: \n: ${error}`)
      );
      return console.log("Error on Apple Sign In: ", error);
    }
  }

  async function handleContinueWithAppleOnAndroidButton() {
    if (!termsAccepted) return startBounceAnimation();

    if (loading) return;

    setLoading(true);

    try {
      if (auth().currentUser) await auth().signOut();
      setAuthStatus("dontMess");

      const rawNonce = uuid();
      const state = uuid();

      // Configure the request
      appleAuthAndroid.configure({
        // The Service ID you registered with Apple
        clientId: process.env.EXPO_PUBLIC_APPLE_AUTH_ANDROID_CLIENT_KEY || "",

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

      const { id_token: identityToken, nonce } =
        await appleAuthAndroid.signIn();

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

      const user = (await auth().signInWithCredential(appleCredential)).user;

      const idTokenResult = await user.getIdTokenResult(true);

      const isValidAuthObject = idTokenResult.claims.isValidAuthObject;

      if (!isValidAuthObject) {
        setLoading(false);
        return router.push("/auth/additionalInfo");
      }

      setAuthStatus("authenticated");

      router.replace("/home");

      return setLoading(false);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("canceled")) {
          setAuthStatus("unauthenticated");
          return setLoading(false);
        }
      }

      setAuthStatus("unauthenticated");
      setLoading(false);
      crashlytics().recordError(
        new Error(`Error on Apple Sign In at welcome screen: \n: ${error}`)
      );
      return console.log("Error on Apple Sign In: ", error);
    }
  }

  async function handleContinueWithGoogleButton() {
    if (!termsAccepted) return startBounceAnimation();
    if (loading) return;

    setLoading(true);

    try {
      if (auth().currentUser) await auth().signOut();

      setAuthStatus("dontMess");

      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_AUTH_ANDROID_WEB_CLIENT_KEY,
      });

      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const data = (await GoogleSignin.signIn()).data;
      if (!data) {
        throw new Error("No data found in the response");
      }

      const idToken = data.idToken;
      if (!idToken) {
        throw new Error("No idToken found in the response");
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      const user = (await auth().signInWithCredential(googleCredential)).user;

      const idTokenResult = await user.getIdTokenResult(true);
      const isValidAuthObject = idTokenResult.claims.isValidAuthObject;

      if (!isValidAuthObject) {
        router.push("/auth/additionalInfo");
        return setLoading(false);
      }

      // We are setting this manually due to dontMess state...
      setAuthStatus("authenticated");

      router.replace("/home");

      return setLoading(false);
    } catch (error: any) {
      if (
        isErrorWithCode(error) &&
        error.code === statusCodes.SIGN_IN_CANCELLED
      ) {
        setAuthStatus("unauthenticated");
        return setLoading(false);
      }

      setAuthStatus("unauthenticated");
      console.error("Error on Google Sign In: ", error);
      crashlytics().recordError(
        new Error(`Error on Google Sign In at welcome screen: \n: ${error}`)
      );
      return setLoading(false);
    }
  }

  function handleContinueWithEmailButon() {
    if (!termsAccepted) return startBounceAnimation();
    if (loading) return;
    router.push("/auth/emailPasswordSignUp");
  }

  const startBounceAnimation = () => {
    const amplitude = 25;

    const sequence = Animated.sequence([
      Animated.timing(translateX, {
        useNativeDriver: true,
        toValue: amplitude,
        duration: 150,
      }),
      Animated.timing(translateX, {
        useNativeDriver: true,
        toValue: -amplitude,
        duration: 150,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]);

    sequence.start();
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        padding: 20,
        justifyContent: "center",
      }}
    >
      <View id="welcome">
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
        <View
          id="welcome-to-header"
          style={{
            width: "100%",
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <Text
            bold
            style={{
              fontSize: 32,
            }}
          >
            Welcome to Apidon
          </Text>
        </View>
      </View>

      <Animated.View
        style={{
          opacity,
        }}
        id="auth-panel-buttons"
      >
        <View
          id="social-auths"
          style={{
            gap: 20,
            padding: 20,
          }}
        >
          {Platform.OS === "ios" ? (
            <Pressable
              disabled={loading}
              onPress={handleContinueWithAppleButton}
              id="apple-continue"
              style={{
                borderRadius: 10,
                padding: 10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                backgroundColor: "white",
              }}
            >
              <AntDesign name="apple1" size={24} color="black" />
              <Text style={{ color: "black" }} fontSize={16} bold>
                Continue with Apple
              </Text>
            </Pressable>
          ) : appleAuthAndroid.isSupported ? (
            <Pressable
              disabled={loading}
              onPress={handleContinueWithAppleOnAndroidButton}
              id="apple-continue"
              style={{
                borderRadius: 10,
                padding: 10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                backgroundColor: "white",
              }}
            >
              <AntDesign name="apple1" size={24} color="black" />
              <Text style={{ color: "black" }} fontSize={16} bold>
                Continue with Apple
              </Text>
            </Pressable>
          ) : (
            <></>
          )}

          <Pressable
            onPress={handleContinueWithGoogleButton}
            id="google-continue"
            style={{
              borderRadius: 10,
              padding: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              backgroundColor: "white",
              justifyContent: "center",
            }}
          >
            <Image
              source={require("@/assets/images/google.png")}
              style={{
                height: 21,
                aspectRatio: 1,
              }}
            />
            <Text style={{ color: "black" }} fontSize={16} bold>
              Continue with Google
            </Text>
          </Pressable>
        </View>
        <View
          id="or-header"
          style={{
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 5,
          }}
        >
          <View
            style={{
              borderWidth: 1,
              borderColor: "gray",
              height: 1,
              width: 100,
            }}
          />
          <Text
            style={{
              color: "white",
              fontSize: 14,
            }}
          >
            Or
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: "gray",
              height: 1,
              width: 100,
            }}
          />
        </View>
        <View
          id="email-auth"
          style={{
            padding: 20,
          }}
        >
          <Pressable
            onPress={handleContinueWithEmailButon}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              borderWidth: 1,
              borderColor: "white",
              padding: 10,
              borderRadius: 10,
              justifyContent: "center",
            }}
          >
            <AntDesign name="mail" size={24} color="white" />
            <Text>Continue with Email</Text>
          </Pressable>
        </View>
      </Animated.View>

      <Animated.View
        id="eula-root"
        style={{
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 30,
          gap: 10,
          transform: [{ translateX }],
        }}
      >
        <View
          id="agreement-divider"
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 5,
          }}
        >
          <View
            style={{
              height: 1,
              borderWidth: 1,
              borderColor: "gray",
              width: "25%",
            }}
          />
          <Ionicons name="documents" size={24} color="white" />
          <View
            style={{
              height: 1,
              borderWidth: 1,
              borderColor: "gray",
              width: "25%",
            }}
          />
        </View>

        <View
          id="eula"
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
            gap: 10,
          }}
        >
          <NativeText
            style={{
              fontWeight: 700,
              fontSize: 12,
              color: "gray",
              textAlign: "center",
            }}
          >
            I confirm that I have read and accepted the terms of{" "}
            <Pressable
              onPress={() => {
                Linking.openURL("https://support.apidon.com/eula");
              }}
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <NativeText
                style={{
                  fontWeight: 700,
                  fontSize: 12,
                  color: "gray",
                  textAlign: "center",
                  textDecorationLine: "underline",
                }}
              >
                Apidon's End-User License Agreement (EULA).
              </NativeText>
            </Pressable>
          </NativeText>
          <Pressable
            onPress={handleAcceptEulaButton}
            style={{
              borderWidth: 1,
              borderColor: termsAccepted ? "green" : "red",
              padding: 5,
              paddingHorizontal: 8,
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              gap: 5,
            }}
          >
            {termsAccepted ? (
              <Fontisto name="checkbox-active" size={14} color="green" />
            ) : (
              <Fontisto name="checkbox-passive" size={14} color="red" />
            )}

            <Text
              style={{
                color: termsAccepted ? "green" : "red",
              }}
              fontSize={11}
            >
              {termsAccepted ? "Accepted" : "Accept"}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default welcome;
