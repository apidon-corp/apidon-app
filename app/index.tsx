import { useAuth } from "@/providers/AuthProvider";
import { Redirect } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, SafeAreaView } from "react-native";
import appCheck from "@react-native-firebase/app-check";

const index = () => {
  const authStatus = useAuth();

  useEffect(() => {
    handleConnectAppCheckServers();
  }, []);

  const handleConnectAppCheckServers = async () => {
    try {
      const provider = appCheck().newReactNativeFirebaseAppCheckProvider();

      provider.configure({
        apple: {
          provider: "debug",
          debugToken: process.env.EXPO_PUBLIC_DEBUG_TOKEN,
        },
      });

      await appCheck().initializeAppCheck({
        provider: provider,
        isTokenAutoRefreshEnabled: true,
      });

      const { token } = await appCheck().getToken();
    } catch (error) {
      console.error(
        "Error on connecting and creating app check token: ",
        error
      );
    }
  };

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
