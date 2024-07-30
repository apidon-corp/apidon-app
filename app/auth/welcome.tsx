import { Text } from "@/components/Text/Text";
import { AntDesign } from "@expo/vector-icons";
import * as AppleAuthentication from "expo-apple-authentication";

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

import { handleGetActiveProviderStatus } from "@/helpers/Provider";

const welcome = () => {
  const { setAuthStatus } = useAuth();

  const [loading, setLoading] = useState(false);

  const opacity = useRef(new Animated.Value(1)).current;

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

  async function handleContinueWithAppleButton() {
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

      const providerStatus = await handleGetActiveProviderStatus();
      if (!providerStatus || !providerStatus.isThereActiveProvider) {
        router.replace("/(modals)/initialProvider");
        return setLoading(false);
      }

      router.replace("/home");

      return setLoading(false);
    } catch (error: any) {
      if (error.code === "ERR_REQUEST_CANCELED") {
        setAuthStatus("unauthenticated");
        return setLoading(false);
      }

      setAuthStatus("unauthenticated");
      setLoading(false);
      return console.log("Error on Apple Sign In: ", error);
    }
  }

  async function handleContinueWithGoogleButton() {
    setLoading(true);

    try {
      if (auth().currentUser) await auth().signOut();

      setAuthStatus("dontMess");

      GoogleSignin.configure({
        webClientId: "",
      });

      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const { idToken } = await GoogleSignin.signIn();

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

      const providerStatus = await handleGetActiveProviderStatus();
      if (!providerStatus || !providerStatus.isThereActiveProvider) {
        router.replace("/(modals)/initialProvider");
        return setLoading(false);
      }

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
      return setLoading(false);
    }
  }

  function handleContinueWithEmailButon() {
    router.push("/auth/emailPasswordSignUp");
  }

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
    </SafeAreaView>
  );
};

export default welcome;
