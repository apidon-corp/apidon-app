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
import { useSetAtom } from "jotai";
import { collectCollectibleAtom } from "@/atoms/collectCollectibleAtom";

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

  const setCollectCollectible = useSetAtom(collectCollectibleAtom);

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
        return router.replace("/home/feed");
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

    const subParts = linking.split("/");
    const content = subParts[3];

    if (!content) return router.replace("/home/feed");

    if (isInitial) {
      if (content === "cc") {
        const code = subParts[4];

        // We open main page
        if (pathname !== "/home/feed") router.replace("/home/feed");

        await delay(500);

        // Then set given code to "atom"
        setCollectCollectible({ code: code });
      } else if (content === "p") {
        const postIdentifier = subParts[4];

        const postIdentifierContents = postIdentifier.split("-");

        const postSender = postIdentifierContents[0];
        const postId = postIdentifierContents[1];

        if (postSender && postId) {
          router.replace("/home");

          await delay(500);

          router.navigate(`/home/feed/post?sender=${postSender}&id=${postId}`);

          await delay(500);
        }
      } else {
        const username = content;
        router.replace("/home");
        await delay(500);
        router.navigate(`/home/feed/profilePage?username=${username}`);
        await delay(500);
      }

      return setLinking({ isInitial: false, url: "" });
    } else {
      // That means we need to open code entering screen with given code.
      if (content === "cc") {
        const code = subParts[4];

        // We open main page
        if (pathname !== "/home/feed") router.navigate("/home/feed");

        await delay(500);

        // Then set given code to "atom"
        setCollectCollectible({ code: code });
      }

      // That means we need to open post page.
      else if (content === "p") {
        const postIdentifier = subParts[4];

        const postIdentifierContents = postIdentifier.split("-");

        const postSender = postIdentifierContents[0];
        const postId = postIdentifierContents[1];

        if (postSender && postId) {
          router.navigate(`/home/feed/post?sender=${postSender}&id=${postId}`);
          await delay(500);
        }
      } else {
        const username = content;
        router.navigate(`/home/feed/profilePage?username=${username}`);
        await delay(500);
      }

      return setLinking({ isInitial: false, url: "" });
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
