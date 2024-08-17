import resetNavigationHistory from "@/helpers/Router";
import { AuthStatus } from "@/types/AuthType";
import { router } from "expo-router";

import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";

import {
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type Props = {
  children: ReactNode;
  linking: {
    isInitial: boolean;
    url: string;
  };
  setLinking: React.Dispatch<
    SetStateAction<{
      isInitial: boolean;
      url: string;
    }>
  >;
};

type AuthContextType = {
  authStatus: AuthStatus;
  setAuthStatus: (status: AuthStatus) => void;
};

const AuthContext = createContext<AuthContextType>({
  authStatus: "unauthenticated",
  setAuthStatus: () => {},
});

export default function AuthProvider({ children, linking, setLinking }: Props) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");

  const authStatusRef = useRef<AuthStatus>("loading");

  const handleAuthentication = async (
    user: FirebaseAuthTypes.User | null,
    authStatusRef: React.MutableRefObject<AuthStatus>
  ) => {
    if (authStatusRef.current === "dontMess") return;

    resetNavigationHistory();

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

    if (!linking.url) return router.replace("/home");
  };

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      handleAuthentication(user, authStatusRef);
    });

    return () => unsubscribe();
  }, [authStatusRef]);

  useEffect(() => {
    authStatusRef.current = authStatus;
  }, [authStatus]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    if (!linking.url) return;

    handleLinking(linking.url, linking.isInitial);
  }, [linking.url, linking.isInitial, authStatus]);

  function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const handleLinking = async (linking: string, isInitial: boolean) => {
    if (!linking) return;
    setLinking({ isInitial: false, url: "" });

    if (isInitial) {
      const subParts = linking.split("/");

      const content = subParts[3];

      if (content === "profile") {
        const username = subParts[4];
        if (username) {
          router.replace("/home");

          await delay(1);

          return router.navigate(`/home/feed/profilePage?username=${username}`);
        }
      }

      if (content === "post") {
        const postIdentifier = subParts[4];

        const postIdentifierContents = postIdentifier.split("-");

        const postSender = postIdentifierContents[0];
        const postId = postIdentifierContents[1];

        if (postSender && postId) {
          router.replace("/home");

          await delay(1);

          return router.navigate(
            `/home/feed/post?sender=${postSender}&id=${postId}`
          );
        }
      }

      router.replace("/home");
    } else {
      const subParts = linking.split("/");

      const content = subParts[3];

      if (content === "profile") {
        const username = subParts[4];
        if (username)
          return router.navigate(`/home/feed/profilePage?username=${username}`);
      }

      if (content === "post") {
        const postIdentifier = subParts[4];

        const postIdentifierContents = postIdentifier.split("-");

        const postSender = postIdentifierContents[0];
        const postId = postIdentifierContents[1];

        if (postSender && postId)
          return router.navigate(
            `/home/feed/post?sender=${postSender}&id=${postId}`
          );
      }

      router.replace("/home");
    }
  };

  return (
    <AuthContext.Provider
      value={{ authStatus: authStatus, setAuthStatus: setAuthStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
