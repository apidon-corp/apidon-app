import resetNavigationHistory from "@/helpers/Router";
import { AuthStatus } from "@/types/AuthType";
import { router, usePathname } from "expo-router";

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

type LinkingValue = {
  isInitial: boolean;
  url: string;
};

type Props = {
  children: ReactNode;
  linking: LinkingValue;
  setLinking: React.Dispatch<SetStateAction<LinkingValue>>;
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

  const linkingRef = useRef<LinkingValue>(linking);

  const pathnameRef = useRef<string>("");
  const pathname = usePathname();

  const handleAuthentication = async (
    user: FirebaseAuthTypes.User | null,
    authStatusRefParam: React.MutableRefObject<AuthStatus>,
    linkingRefParam: React.MutableRefObject<LinkingValue>,
    pathnameRefParam: React.MutableRefObject<string>
  ) => {
    if (authStatusRefParam.current === "dontMess") return;

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

    if (!linkingRefParam.current.url) {
      if (pathnameRefParam.current !== "/home/feed")
        return router.replace("/(modals)/createCollectible");
    }
  };

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      handleAuthentication(user, authStatusRef, linkingRef, pathnameRef);
    });

    return () => unsubscribe();
  }, [authStatusRef, linkingRef, pathnameRef]);

  useEffect(() => {
    authStatusRef.current = authStatus;
  }, [authStatus]);

  useEffect(() => {
    linkingRef.current = linking;
  }, [linking]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    if (!linking.url) return;

    handleLinking(linking.url, linking.isInitial);
  }, [linking.url, linking.isInitial, authStatus]);

  // Handling pathname ref
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const handleLinking = async (linking: string, isInitial: boolean) => {
    if (!linking) return;

    if (isInitial) {
      const subParts = linking.split("/");

      const content = subParts[3];

      if (content === "profile") {
        const username = subParts[4];
        if (username) {
          router.replace("/home");

          await delay(1);

          router.navigate(`/home/feed/profilePage?username=${username}`);

          await delay(500);

          return setLinking({ isInitial: false, url: "" });
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

          router.navigate(`/home/feed/post?sender=${postSender}&id=${postId}`);

          await delay(500);

          return setLinking({ isInitial: false, url: "" });
        }
      }

      router.replace("/home");
    } else {
      const subParts = linking.split("/");

      const content = subParts[3];

      if (content === "profile") {
        const username = subParts[4];
        if (username) {
          router.navigate(`/home/feed/profilePage?username=${username}`);
          await delay(500);
          return setLinking({ isInitial: false, url: "" });
        }
      }

      if (content === "post") {
        const postIdentifier = subParts[4];

        const postIdentifierContents = postIdentifier.split("-");

        const postSender = postIdentifierContents[0];
        const postId = postIdentifierContents[1];

        if (postSender && postId) {
          router.navigate(`/home/feed/post?sender=${postSender}&id=${postId}`);
          await delay(500);
          return setLinking({ isInitial: false, url: "" });
        }
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
