import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

const useCheckInternet = () => {
  const [isConnected, setIsConnected] = useState(false);

  const checkConnection = (state: NetInfoState) => {
    const isConnected = state.isConnected || false;
    const isReachable = state.isInternetReachable || false;

    setIsConnected(isConnected && isReachable);
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      checkConnection(state);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isConnected,
  };
};

export default useCheckInternet;
