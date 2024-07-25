import resetNavigationHistory from "@/helpers/Router";
import { AuthStatus } from "@/types/AuthType";
import { router, usePathname } from "expo-router";

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

  const pathname = usePathname();

  const authStatusRef = useRef<AuthStatus>("loading");

  const handleAuthentication = async (
    user: FirebaseAuthTypes.User | null,
    authStatusRef: React.MutableRefObject<AuthStatus>
  ) => {
    console.log("Auth Status Ref Value: ", authStatusRef.current);
    if (authStatusRef.current === "dontMess") {
      console.log("We are on dontMess status.");
      return;
    }

    if (!user) {
      console.log("There is no user.");
      console.log("We are switching to welcome page now.");
      setAuthStatus("unauthenticated");

      resetNavigationHistory();
      return router.replace("/auth/welcome");
    }

    setAuthStatus("loading");

    console.log("It seems there is a user, let's make some tests...");

    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) {
      console.error("There is no current user object.");
      console.error(
        "This is a weird situation because there was before.(Upper comments)"
      );
      console.error("We are switching to welcome page now., again.");
      setAuthStatus("unauthenticated");

      resetNavigationHistory();
      return router.replace("/auth/welcome");
    }

    console.log("We got the current user object successfully.");

    try {
      await currentUserAuthObject.reload();

      const idTokenResult = await currentUserAuthObject.getIdTokenResult(true);

      const isValidAuthObject = idTokenResult.claims.isValidAuthObject;

      if (!isValidAuthObject) {
        setAuthStatus("unauthenticated");

        console.log("User didn't complete sign-up operation or a new user.");
        console.log("We are switching additionalInfo page now.");

        console.log("We are on path: ", pathname);

        resetNavigationHistory();
        router.replace("/auth/welcome");
        return router.navigate("/auth/additionalInfo");
      }
    } catch (error) {
      setAuthStatus("unauthenticated");
      console.log("Error on making auth test...: ", error);

      resetNavigationHistory();
      return router.replace("/auth/welcome");
    }

    setAuthStatus("authenticated");

    console.log("All test are looking good...");
    console.log("We need to switch provider or home page for now...");

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
