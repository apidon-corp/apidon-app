import { Text } from "@/components/Text/Text";
import auth from "@react-native-firebase/auth";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable } from "react-native";

import * as AppleAuthentication from "expo-apple-authentication";

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

      await currentUserAuthObject.delete();

      return setLoading(false);
    } catch (error) {
      console.error(error);
      return setLoading(false);
    }
  };

  const handlePressButton = () => {
    Alert.alert(
      "Are You Sure?",
      "\nDisconnecting your Apple account from Apidon will remove all related access.\n\n This action cannot be undone.\n\n Do you want to proceed?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        { text: "Disconnect", onPress: handleDeleteAccount, style: "destructive" },
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
          <Text style={{ fontSize: 14, color: "red", fontWeight: "bold" }}>
            Disconnect Your Account
          </Text>
          <Text style={{ fontSize: 12, color: "gray", fontWeight: "bold" }}>
            Remove the link between your Apple account and Apidon.
          </Text>
        </>
      )}
    </Pressable>
  );
};

export default DeleteAccount;
