import { useState, useEffect, useCallback, useRef } from "react";
import appCheck from "@react-native-firebase/app-check";
import * as Device from "expo-device";

import { Alert } from "react-native";

const MAX_RETRIES = 5;
const RETRY_DELAY = 3000; // 3 seconds

const useAppCheck = () => {
  const [appCheckLoaded, setAppCheckLoaded] = useState(false);

  const retryCountRef = useRef(0);

  const initializeAppCheck = async (
    retryCountRef: React.MutableRefObject<number>
  ) => {
    try {
      const provider = appCheck().newReactNativeFirebaseAppCheckProvider();

      const debugToken = process.env.EXPO_PUBLIC_DEBUG_TOKEN || "";
      if (!debugToken) {
        console.error("Debug token is not defined from environment variables.");
      }

      provider.configure({
        apple: {
          provider: Device.isDevice ? "deviceCheck" : "debug",
          debugToken: debugToken,
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
