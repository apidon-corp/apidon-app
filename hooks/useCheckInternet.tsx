import NetInfo from "@react-native-community/netinfo";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

const MAX_RETRIES = 10;
const RETRY_DELAY = 500;

const useCheckInternet = () => {
  const [connectionStatus, setConnectionStatus] = useState(false);

  const netInfoRef = useRef(false);

  const retryCountRef = useRef(0);

  const checkConnection = (
    retryCountRef: React.MutableRefObject<number>,
    netInfoRef: React.MutableRefObject<boolean>
  ) => {
    if (connectionStatus) return;

    const status = netInfoRef.current;

    setConnectionStatus(status);

    if (!status) {
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current++;
        setTimeout(() => {
          checkConnection(retryCountRef, netInfoRef);
        }, RETRY_DELAY);
      } else {
        Alert.alert(
          "Check Your Connection",
          "Please check your internet connection and try again."
        );
      }
    } else {
      retryCountRef.current = 0;
    }
  };

  useEffect(() => {
    if (!connectionStatus) {
      checkConnection(retryCountRef, netInfoRef);
    }
  }, [connectionStatus, retryCountRef, netInfoRef]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected || false;
      const isInternetReachable = state.isInternetReachable || false;

      const status = isConnected && isInternetReachable;

      netInfoRef.current = status;
    });

    // Unsubscribe
    return () => unsubscribe();
  }, []);

  return {
    connectionStatus,
  };
};

export default useCheckInternet;
