import resetNavigationHistory from "@/helpers/Router";
import { AuthStatus } from "@/types/AuthType";
import { router } from "expo-router";

import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";

import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type AuthContextType = {
  authStatus: AuthStatus;
  setAuthStatus: (status: AuthStatus) => void;
};

const AuthContext = createContext<AuthContextType>({
  authStatus: "unauthenticated",
  setAuthStatus: () => {},
});

export default function AuthProvider({ children }: PropsWithChildren) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");

  const authStatusRef = useRef<AuthStatus>("loading");

  const handleAuthentication = async (
    user: FirebaseAuthTypes.User | null,
    authStatusRef: React.MutableRefObject<AuthStatus>
  ) => {
    if (authStatusRef.current === "dontMess") {
      console.log("We are on dontMess status.");
      return;
    }

    if (!user) {
      setAuthStatus("unauthenticated");
      resetNavigationHistory();
      return router.replace("/auth/welcome");
    }

    setAuthStatus("loading");

    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) {
      console.error("There is no current user object.");
      console.error(
        "This is a weird situation because there was before.(Upper comments)"
      );
      setAuthStatus("unauthenticated");

      resetNavigationHistory();
      return router.replace("/auth/welcome");
    }

    try {
      await currentUserAuthObject.reload();

      const idTokenResult = await currentUserAuthObject.getIdTokenResult(true);

      const isValidAuthObject = idTokenResult.claims.isValidAuthObject;

      if (!isValidAuthObject) {
        setAuthStatus("unauthenticated");

        resetNavigationHistory();
        router.replace("/auth/welcome");
        return router.navigate("/auth/additionalInfo");
      }
    } catch (error) {
      setAuthStatus("unauthenticated");
      console.error("Error on making auth test...: ", error);

      resetNavigationHistory();
      return router.replace("/auth/welcome");
    }

    setAuthStatus("authenticated");

    resetNavigationHistory();
    return router.replace("/(modals)/initialProvider");
  };

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      handleAuthentication(user, authStatusRef);
    });

    return () => unsubscribe();
  }, [authStatusRef]);

  useEffect(() => {
    console.log("Auth Status: ", authStatus);
    authStatusRef.current = authStatus;
  }, [authStatus]);

  return (
    <AuthContext.Provider
      value={{ authStatus: authStatus, setAuthStatus: setAuthStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
