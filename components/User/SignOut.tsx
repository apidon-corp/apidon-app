import { ActivityIndicator, Alert, Pressable } from "react-native";
import React, { useState } from "react";
import auth from "@react-native-firebase/auth";
import { Text } from "@/components/Text/Text";

const SignOut = () => {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    if (loading) return;

    setLoading(true);
    await auth().signOut();
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
