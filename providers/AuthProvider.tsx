import { handleGetActiveProviderStatus } from "@/helpers/Provider";
import resetNavigationHistory from "@/helpers/Router";
import { AuthStatus } from "@/types/AuthType";
import { router } from "expo-router";

import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";

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

  const getCurrentUserDisplayName = async () => {
    try {
      const currentUserAuthObject = auth().currentUser;
      if (!currentUserAuthObject) return false;

      await currentUserAuthObject.getIdToken(true);
      await currentUserAuthObject.reload();

      const userRecord = await currentUserAuthObject.getIdTokenResult();

      // Here means, user just authencticated with social provider like "google" or "apple" but not finished authentication completely like username and fullname.
      if (!userRecord.claims.isValidAuthObject) {
        console.log("User's auth object is not valid.");
        return false;
      }

      const displayName = currentUserAuthObject.displayName;

      console.log("Display Name: ", displayName);

      // Here is impossible condition. Can be deleted.
      if (!displayName) {
        console.log("currentUser has no display name on it");
        return false;
      }

      return displayName;
    } catch (error) {
      console.error("Error on checking if there is a current user: ", error);
      return false;
    }
  };

  const handleInitialAuthentication = async (
    user: FirebaseAuthTypes.User | null
  ) => {
    resetNavigationHistory();

    if (!user) {
      setAuthStatus("unauthenticated");
      return router.replace("/auth/login");
    }

    setAuthStatus("loading");

    const currentUserDisplayName = await getCurrentUserDisplayName();

    if (!currentUserDisplayName) {
      setAuthStatus("unauthenticated");
      router.replace("/auth/login");
      return router.navigate("/auth/login/extraInformation");
    }

    const providerResult = await handleGetActiveProviderStatus();

    if (!providerResult) {
      setAuthStatus("unauthenticated");
      return router.replace("/auth");
    }

    if (!providerResult.isThereActiveProvider) {
      setAuthStatus("authenticated");
      return router.replace("/(modals)/initialProvider");
    }

    setAuthStatus("authenticated");
    return router.replace(`/home`);
  };

  useEffect(() => {
    router.replace("/auth/welcome")
    const unsubscribe = auth().onAuthStateChanged((user) => {
      //handleInitialAuthentication(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={authStatus}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
