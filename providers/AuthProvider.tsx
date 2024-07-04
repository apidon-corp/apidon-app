import { auth } from "@/firebase/client";
import { handleGetActiveProviderStatus } from "@/helpers/Provider";
import { AuthStatus } from "@/types/AuthType";
import { router } from "expo-router";

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
      const currentUserAuthObject = auth.currentUser;
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
    setAuthStatus("loading");

    const currentUserDisplayName = getCurrentUserDisplayName();

    if (currentUserDisplayName) {
      const providerResult = await handleGetActiveProviderStatus();

      if (!providerResult) {
        setAuthStatus("unauthenticated");
        router.replace("/");
        return;
      }

      if (!providerResult.isThereActiveProvider) {
        setAuthStatus("authenticated");
        router.replace("(modals)/initialProvider");
        return;
      }

      setAuthStatus("authenticated");
      router.replace(`/home`);
    } else {
      setAuthStatus("unauthenticated");
      router.replace("/");
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      handleInitialAuthentication();
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={authStatus}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
