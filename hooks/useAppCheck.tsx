import { useState, useEffect } from "react";
import appCheck from "@react-native-firebase/app-check";
import * as Device from "expo-device";
import * as Sentry from "@sentry/react-native";

const MAX_RETRIES = 3;
const RETRY_DELAY = 3000; // 3 seconds

const useAppCheck = () => {
  const [appCheckLoaded, setAppCheckLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const initializeAppCheck = async () => {
      try {
        const provider = appCheck().newReactNativeFirebaseAppCheckProvider();

        provider.configure({
          apple: {
            provider: Device.isDevice ? "deviceCheck" : "debug",
            debugToken: process.env.EXPO_PUBLIC_DEBUG_TOKEN,
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
        if (retryCount < MAX_RETRIES) {
          setRetryCount((prev) => prev + 1);
          setTimeout(initializeAppCheck, RETRY_DELAY);
        } else {
          Sentry.captureException(
            `Error on connecting and creating app check token: \n ${error}`
          );
          console.error(
            "Error on connecting and creating app check token: ",
            error
          );
          setAppCheckLoaded(false);
        }
      }
    };

    initializeAppCheck();
  }, [retryCount]);

  return appCheckLoaded;
};

export default useAppCheck;
