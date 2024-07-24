import { useAuth } from "@/providers/AuthProvider";
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
};

export default index;
