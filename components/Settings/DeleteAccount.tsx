import { ActivityIndicator, Alert, Pressable } from "react-native";
import React, { useState } from "react";
import auth from "@react-native-firebase/auth";
import { Text } from "@/components/Text/Text";

import * as AppleAuthentication from "expo-apple-authentication";

import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { router } from "expo-router";

const DeleteAccount = () => {
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const currentUserAuthObject = auth().currentUser;

      if (!currentUserAuthObject) {
        console.error("No user found to delete.");
        return setLoading(false);
      }

      await currentUserAuthObject.getIdToken(true);

      const providerData = currentUserAuthObject.providerData;
      const providerId = providerData[0].providerId;

      const isApple = providerId === "apple.com";
      const isGoogle = providerId === "google.com";
      const isPassword = providerId === "password";

      if (isApple) {
        const { authorizationCode, identityToken } =
          await AppleAuthentication.refreshAsync({
            user: currentUserAuthObject.uid,
          });

        if (!authorizationCode) {
          console.error("No authorization code found to revoke apple user.");
          return setLoading(false);
        }

        const appleCredential =
          auth.AppleAuthProvider.credential(identityToken);

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
        setLoading(false);
        return router.push("/(modals)/settings/passwordDeleteAccount");
      }

      await currentUserAuthObject.delete();

      return setLoading(false);
    } catch (error) {
      console.error(error);
      return setLoading(false);
    }
  };

  const handlePressButton = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        { text: "Delete", onPress: handleDeleteAccount, style: "destructive" },
      ]
    );
  };

  return (
    <Pressable
      style={{
        padding: 15,
        borderWidth: 1,
        borderColor: "red",
        borderRadius: 10,
        width: "100%",
        gap: 5,
      }}
      onPress={handlePressButton}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="red" />
      ) : (
        <>
          <Text bold style={{ fontSize: 14, color: "red" }}>
            Delete Account
          </Text>
          <Text style={{ fontSize: 12, color: "gray" }} bold>
            Delete your account to permanently remove all your data.
          </Text>
        </>
      )}
    </Pressable>
  );
};

export default DeleteAccount;
