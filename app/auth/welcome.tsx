import { ActivityIndicator, Animated, Pressable, View } from "react-native";
import { Text } from "@/components/Text/Text";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import appleAuth from "@invertase/react-native-apple-authentication";

import auth from "@react-native-firebase/auth";
import { router } from "expo-router";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Image } from "expo-image";

const welcome = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      const user = (await auth().signInWithCredential(appleCredential)).user;

      const idTokenResult = await user.getIdTokenResult(true);

      const isValidAuthObject = idTokenResult.claims.isValidAuthObject;

      if (!isValidAuthObject) {
        console.log("User didn't complete sign-up operation or a new user.");
        console.log("We are switching additionalInfo page now.");
        setLoading(false);

        return router.push("/auth/additionalInfo");
      }

      console.log("User signed in successfully");
      console.log("We are switching home page now.");

      setLoading(false);

      return router.replace("/home");
    } catch (error) {
      setLoading(false);
      return console.log("Error on Apple Sign In: ", error);
    }
  };

  async function handleGoogleSignInButton() {
    setLoading(true);

    try {
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
        console.log("User didn't complete sign-up operation or a new user.");
        console.log("We are switching additionalInfo page now.");
        setLoading(false);

        return router.push("/auth/additionalInfo");
      }

      console.log("User signed in successfully");
      console.log("We are switching home page now.");

      setLoading(false);

      return router.replace("/home");
    } catch (error) {
      setLoading(false);
      return console.log("Error on Google Sign In: ", error);
    }
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
            onPress={handleAppleSignInButton}
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
            onPress={handleGoogleSignInButton}
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
            <AntDesign name="google" size={24} color="black" />
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
