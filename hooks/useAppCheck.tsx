import appCheck from "@react-native-firebase/app-check";
import * as Device from "expo-device";
import { useEffect, useRef, useState } from "react";

import { Alert } from "react-native";

import crashlytics from "@react-native-firebase/crashlytics";
import { Environment } from "@/types/Environment";

const MAX_RETRIES = 10;
const RETRY_DELAY = 500;

const useAppCheck = () => {
  const [appCheckLoaded, setAppCheckLoaded] = useState(false);

  const retryCountRef = useRef(0);

  const initializeAppCheck = async (
    retryCountRef: React.MutableRefObject<number>
  ) => {
    try {
      const provider = appCheck().newReactNativeFirebaseAppCheckProvider();

      const environment = process.env.EXPO_PUBLIC_ENVIRONMENT as Environment;
      if (!environment)
        return console.error(
          "Environment is not defined from environment variables."
        );

      provider.configure({
        apple: {
          provider:
            environment === "DEVELOPMENT" || environment === "LOCALPREVIEW"
              ? "debug"
              : Device.isDevice
              ? "deviceCheck"
              : "debug",
          debugToken: process.env.EXPO_PUBLIC_DEBUG_TOKEN,
        },
        android: {
          provider: environment === "DEVELOPMENT" ? "debug" : "playIntegrity",
          debugToken: process.env.EXPO_PUBLIC_ANDROID_DEBUG_TOKEN,
        },
      });

      await appCheck().initializeAppCheck({
        provider: provider,
        isTokenAutoRefreshEnabled: true,
      });

      const { token } = await appCheck().getToken();

      if (token.length > 0) {
        setAppCheckLoaded(true);
      } else {
        throw new Error("Token length is 0");
      }
    } catch (error) {
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current++;
        setTimeout(() => {
          initializeAppCheck(retryCountRef);
        }, RETRY_DELAY);
      } else {
        Alert.alert(
          "Connection Error",
          "Failed to connect securely to Apidon. Please try again later."
        );
        console.error(
          "Error on connecting and creating app check token: ",
          error
        );
        crashlytics().recordError(
          new Error(
            "Error on connecting and creating app check token: " + error
          )
        );
        setAppCheckLoaded(false);
      }
    }
  };

  useEffect(() => {
    if (!appCheckLoaded) {
      initializeAppCheck(retryCountRef);
    }
  }, [appCheckLoaded, retryCountRef]);

  return appCheckLoaded;
};

export default useAppCheck;
