import { handleGetActiveProviderStatus } from "@/helpers/Provider";
import resetNavigationHistory from "@/helpers/Router";
import { AuthStatus } from "@/types/AuthType";
import { router } from "expo-router";

import auth from "@react-native-firebase/auth";

import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext<AuthStatus>("loading");

export default function AuthProvider({ children }: PropsWithChildren) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");

  const getCurrentUserDisplayName = () => {
    try {
      const currentUserAuthObject = auth().currentUser;
      if (!currentUserAuthObject) return false;

      const displayName = currentUserAuthObject.displayName;

      if (!displayName) {
        console.error("currentUser has no display name on it");
        return false;
      }

      return displayName;
    } catch (error) {
      console.error("Error on checking if there is a current user: ", error);
      return false;
    }
  };

  const handleInitialAuthentication = async () => {
    resetNavigationHistory();

    setAuthStatus("loading");

    const currentUserDisplayName = getCurrentUserDisplayName();

    if (!currentUserDisplayName) {
      setAuthStatus("unauthenticated");
      return router.replace("/");
    }

    const providerResult = await handleGetActiveProviderStatus();

    if (!providerResult) {
      setAuthStatus("unauthenticated");
      return router.replace("/");
    }

    if (!providerResult.isThereActiveProvider) {
      setAuthStatus("authenticated");
      return router.replace("/(modals)/initialProvider");
    }

    setAuthStatus("authenticated");
    return router.replace(`/(modals)/listNFT`);
  };

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      handleInitialAuthentication();
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={authStatus}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
