import { ActivityIndicator, Alert, Pressable } from "react-native";
import React, { useState } from "react";
import auth from "@react-native-firebase/auth";
import { Text } from "@/components/Text/Text";
import { updateNotificationTokenOnFirebase } from "@/utils/notificationHelpers";
import { router } from "expo-router";

const SignOut = () => {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    if (loading) return;

    setLoading(true);
    const updateTokenOnFirebaseResult = await updateNotificationTokenOnFirebase(
      ""
    );

    if (!updateTokenOnFirebaseResult) {
      Alert.alert(
        "Error",
        "An error occurred while signing out. Please try again later."
      );
      return setLoading(false);
    }

    await auth().signOut();

    // Normally, it does automatically redirect user to welcome (auth) page.
    // But after integrating universal linking, sometimes user is not forwarded.
    // So, we manually redirect user.

    router.replace("/auth/welcome");

    setLoading(false);
  };

  const handlePressButton = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      { text: "Sign Out", onPress: handleSignOut, style: "destructive" },
    ]);
  };

  return (
    <Pressable
      style={{
        padding: 15,
        borderWidth: 1,
        borderColor: "gray",
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
          <Text bold style={{ fontSize: 14, color: "white" }}>
            Sign Out
          </Text>
          <Text style={{ fontSize: 12, color: "gray" }} bold>
            Sign out to securely end your session and protect your account.
          </Text>
        </>
      )}
    </Pressable>
  );
};

export default SignOut;
