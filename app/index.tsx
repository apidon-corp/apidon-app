import { useAuth } from "@/providers/AuthProvider";
import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, SafeAreaView } from "react-native";

const index = () => {
  const authStatus = useAuth();

  if (authStatus === "loading")
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );

  if (authStatus === "unauthenticated") return <Redirect href="/auth" />;
  if (authStatus === "authenticated")
    return <Redirect href="/home/profile/[username]" />;
};

export default index;
