import NetInfo from "@react-native-community/netinfo";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

const MAX_RETRIES = 10;
const RETRY_DELAY = 500;

const useCheckInternet = () => {
  const [connectionStatus, setConnectionStatus] = useState(false);
  const netInfoRef = useRef(false);
  const retryCountRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkConnection = () => {
    const status = netInfoRef.current;

    setConnectionStatus(status);

    if (!status && retryCountRef.current < MAX_RETRIES) {
      retryCountRef.current++;
      timeoutRef.current = setTimeout(checkConnection, RETRY_DELAY);
    } else if (!status && retryCountRef.current >= MAX_RETRIES) {
      Alert.alert(
        "Check Your Connection",
        "Please check your internet connection and try again."
      );
    } else {
      retryCountRef.current = 0;
    }
  };

  useEffect(() => {
    if (!connectionStatus) {
      checkConnection();
    }

    return () => {
      // Cleanup any ongoing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [connectionStatus]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected || false;
      const isInternetReachable = state.isInternetReachable || false;
      const status = isConnected && isInternetReachable;

      netInfoRef.current = status;

      // Trigger connection check immediately when network state changes
      setConnectionStatus(status);
    });

    // Cleanup the subscription on unmount
    return () => unsubscribe();
  }, []);

  return { connectionStatus };
};

export default useCheckInternet;
