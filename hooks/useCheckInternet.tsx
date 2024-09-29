import NetInfo, { useNetInfo } from "@react-native-community/netinfo";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

const MAX_RETRIES = 5;
const RETRY_DELAY = 1500;

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
      const oState = state.isConnected || false;

      netInfoRef.current = oState;
    });

    // Unsubscribe
    unsubscribe();
  }, []);

  return {
    connectionStatus,
  };
};

export default useCheckInternet;
