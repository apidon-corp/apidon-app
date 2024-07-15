import { useAuth } from "@/providers/AuthProvider";
import { Redirect } from "expo-router";
import React, { useCallback, useEffect } from "react";
import { ActivityIndicator, Linking, SafeAreaView } from "react-native";
import appCheck from "@react-native-firebase/app-check";
import { useStripe } from "@stripe/stripe-react-native";

const index = () => {
  const authStatus = useAuth();

  const { handleURLCallback } = useStripe();

  const handleDeepLink = useCallback(
    async (url: string | null) => {
      if (url) {
        const stripeHandled = await handleURLCallback(url);
        if (stripeHandled) {
          // This was a Stripe URL - you can return or add extra handling here as you see fit
        } else {
          // This was NOT a Stripe URL – handle as you normally would
        }
      }
    },
    [handleURLCallback]
  );

  useEffect(() => {
    const getUrlAsync = async () => {
      const initialUrl = await Linking.getInitialURL();
      handleDeepLink(initialUrl);
    };

    getUrlAsync();

    const deepLinkListener = Linking.addEventListener(
      "url",
      (event: { url: string }) => {
        handleDeepLink(event.url);
      }
    );

    return () => deepLinkListener.remove();
  }, [handleDeepLink]);

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
