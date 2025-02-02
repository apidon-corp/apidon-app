import { AuthStatus } from "@/types/AuthType";
import { router, usePathname } from "expo-router";

import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";

import { collectCollectibleAtom } from "@/atoms/collectCollectibleAtom";
import resetNavigationHistoryWithNewPath from "@/helpers/Router";
import { useSetAtom } from "jotai";
import {
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getData, storeData } from "@/helpers/Storage";
import { authStatusAtom } from "@/atoms/authStatusAtom";

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

  const setAuthStatusAtom = useSetAtom(authStatusAtom);

  const authStatusRef = useRef<AuthStatus>("loading");

  const linkingRef = useRef<LinkingValue>(linking);

  const pathnameRef = useRef<string>("");
  const pathname = usePathname();

  const setCollectCollectible = useSetAtom(collectCollectibleAtom);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      handleAuthentication(user, authStatusRef, linkingRef, pathnameRef);
    });

    return () => unsubscribe();
  }, [authStatusRef, linkingRef, pathnameRef]);

  useEffect(() => {
    authStatusRef.current = authStatus;

    // This line enables outer parts of App can read auth status. (for example, general layout);
    setAuthStatusAtom(authStatus);
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

  const handleAuthentication = async (
    user: FirebaseAuthTypes.User | null,
    authStatusRefParam: React.MutableRefObject<AuthStatus>,
    linkingRefParam: React.MutableRefObject<LinkingValue>,
    pathnameRefParam: React.MutableRefObject<string>
  ) => {
    if (authStatusRefParam.current === "dontMess") return;

    setAuthStatus("loading");

    resetNavigationHistoryWithNewPath("/");

    if (!user) {
      setAuthStatus("unauthenticated");
      return resetNavigationHistoryWithNewPath("/auth/welcome");
    }

    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) {
      console.error("There is no current user object.");
      console.error(
        "This is a weird situation because there was before.(Upper comments)"
      );
      setAuthStatus("unauthenticated");

      return resetNavigationHistoryWithNewPath("/auth/welcome");
    }

    const isThereValidAuthObjectBeforeOnThisDevice =
      await hasValidAuthObjectBeforeDevice(
        currentUserAuthObject.displayName || ""
      );

    if (!isThereValidAuthObjectBeforeOnThisDevice) {
      try {
        await currentUserAuthObject.reload();

        const idTokenResult = await currentUserAuthObject.getIdTokenResult(
          true
        );

        const isValidAuthObject = idTokenResult.claims.isValidAuthObject;

        if (!isValidAuthObject) {
          setAuthStatus("unauthenticated");

          resetNavigationHistoryWithNewPath("/auth/welcome");
          return router.navigate("/auth/additionalInfo");
        }

        const displayName = currentUserAuthObject.displayName || "";
        if (!displayName) {
          console.error(
            "No display name found on user object. Even there is valid auth object (from firebase)"
          );
          return resetNavigationHistoryWithNewPath("/auth/welcome");
        }

        setHasValidObjectBeforeDevice(displayName);
      } catch (error) {
        setAuthStatus("unauthenticated");
        console.error("Error on making auth test...: ", error);
        return resetNavigationHistoryWithNewPath("/auth/welcome");
      }
    }

    setAuthStatus("authenticated");

    if (!linkingRefParam.current.url) {
      if (pathnameRefParam.current !== "/home/feed")
        return router.replace("/home/feed");
    }
  };

  const handleLinking = async (linking: string, isInitial: boolean) => {
    if (!linking) return;

    const appSlug = process.env.EXPO_PUBLIC_APP_SLUG || "";
    if (!appSlug) return;

    let linkType: "deep" | "universal";

    const partsOfLink = linking.split("/");

    if (partsOfLink[0] === `${appSlug}:`) linkType = "deep";
    else linkType = "universal";

    let contentType;

    let baseIndex: 2 | 3 = 2;
    if (linkType === "deep") {
      baseIndex = 2;
      if (partsOfLink[baseIndex] === "cc") contentType = "collectibleCode";
      else if (partsOfLink[baseIndex] === "p") contentType = "post";
      else contentType = partsOfLink[baseIndex]; // profile
    } else {
      baseIndex = 3;
      if (partsOfLink[baseIndex] === "cc") contentType = "collectibleCode";
      else if (partsOfLink[baseIndex] === "p") contentType = "post";
      else contentType = partsOfLink[baseIndex]; // profile
    }

    const contentData = partsOfLink[baseIndex + 1];

    if (contentType === "collectibleCode") {
      if (isInitial) {
        if (pathname !== "/home/feed") router.replace("/home/feed");
      } else {
        if (pathname !== "/home/feed") router.navigate("/home/feed");
      }

      await delay(500);
      setCollectCollectible({ code: contentData });

      return setLinking({ isInitial: false, url: "" });
    } else if (contentType === "post") {
      const postId = contentData;

      if (!postId) {
        console.error("Error on parsing postIdentifier: ", postId);
        return setLinking({ isInitial: false, url: "" });
      }

      if (isInitial) {
        router.replace("/home");
      }

      await delay(500);

      router.navigate(`/home/feed/post?id=${postId}`);

      await delay(500);

      return setLinking({ isInitial: false, url: "" });
    } else {
      const username = contentType;

      console.log("username: ", username);

      if (isInitial) {
        router.replace("/home");
      }

      await delay(500);
      router.navigate(`/home/feed/profilePage?username=${username}`);
      await delay(500);

      return setLinking({ isInitial: false, url: "" });
    }
  };

  function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const hasValidAuthObjectBeforeDevice = async (displayName: string) => {
    if (!displayName) return false;

    const result = await getData(displayName);

    return result !== null;
  };

  const setHasValidObjectBeforeDevice = async (displayName: string) => {
    await storeData(displayName, "true");
    return true;
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
