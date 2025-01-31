import "expo-dev-client";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, router } from "expo-router";
import { SetStateAction, useCallback, useEffect, useState } from "react";

import { SplashScreen } from "expo-router";

import AuthProvider from "@/providers/AuthProvider";
import { Dimensions, Linking, Platform, StatusBar } from "react-native";

import NotificationProvider from "@/providers/NotificationProvider";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

import useAppCheck from "@/hooks/useAppCheck";
import useCheckUpdate from "@/hooks/useCheckUpdate";
import { Image } from "expo-image";

import { authStatusAtom } from "@/atoms/authStatusAtom";
import * as NavigationBar from "expo-navigation-bar";
import { useAtomValue } from "jotai";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "index",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

type Props = {
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

function RootLayoutNav({ linking, setLinking }: Props) {
  return (
    <AuthProvider linking={linking} setLinking={setLinking}>
      <NotificationProvider>
        <StatusBar barStyle="light-content" />
        <ThemeProvider value={DarkTheme}>
          <GestureHandlerRootView
            style={{
              flex: 1,
            }}
          >
            <BottomSheetModalProvider>
              <Stack>
                <Stack.Screen
                  name="(modals)"
                  options={{
                    headerShown: false,
                    presentation: "modal",
                  }}
                />

                <Stack.Screen
                  name="auth"
                  options={{
                    headerShown: false,
                    title: "Auth",
                  }}
                />

                <Stack.Screen
                  name="home"
                  options={{
                    title: "Home",
                    headerShown: false,
                  }}
                />

                <Stack.Screen
                  name="index"
                  options={{
                    title: "index",
                    headerShown: false,
                  }}
                />

                <Stack.Screen
                  name="+not-found"
                  options={{
                    title: "Not Found",
                  }}
                />
              </Stack>
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </ThemeProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

function RootLayout() {
  const [loaded, error] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    ...FontAwesome.font,
  });

  const isAndroid = Platform.OS === "android";

  if (isAndroid) {
    // enables edge-to-edge mode
    NavigationBar.setPositionAsync("absolute");
    // transparent backgrounds to see through
    NavigationBar.setBackgroundColorAsync("#ffffff00");
    // changes the color of the button icons "dark||light"
    NavigationBar.setButtonStyleAsync("dark");
  }

  const appCheckLoaded = useAppCheck();

  const { versionStatus } = useCheckUpdate();

  const [linking, setLinking] = useState<{
    isInitial: boolean;
    url: string;
  }>({
    isInitial: true,
    url: "",
  });

  const [appReady, setAppReady] = useState(false);

  const [animationReady, setAnimationReady] = useState(false);

  const opacity = useSharedValue(1);

  const { width, height } = Dimensions.get("screen");

  const authStatusValue = useAtomValue(authStatusAtom);

  SplashScreen.preventAutoHideAsync();

  // Linking
  useEffect(() => {
    // Handle the initial URL if the app is opened via a Universal Link
    const handleInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (!initialUrl) return;

      const baseURL = process.env.EXPO_PUBLIC_APP_LINK_BASE_URL || "";
      if (initialUrl === baseURL || initialUrl == `${baseURL}/`) return;

      const timeStampedURL = initialUrl + "/" + Date.now().toString();

      setLinking({
        isInitial: true,
        url: timeStampedURL,
      });
    };

    handleInitialURL();

    // Listen for incoming URLs when the app is already open
    const subscription = Linking.addListener("url", (event) => {
      const url = event.url;
      if (!url) return;

      const baseURL = process.env.EXPO_PUBLIC_APP_LINK_BASE_URL || "";
      if (url === baseURL || url == `${baseURL}/`) return;

      const timeStampedURL = url + "/" + Date.now().toString();

      // To prevent "auto" redirecting....
      // Not a good solution.
      if (router.canGoBack()) router.back();

      setLinking({
        isInitial: false,
        url: timeStampedURL,
      });
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Handle App Ready State
  useEffect(() => {
    const status =
      loaded && appCheckLoaded && versionStatus === "hasLatestVersion";

    setAppReady(status);
  }, [loaded, appCheckLoaded, versionStatus]);

  // Handle animation...
  useEffect(() => {
    const status = animationReady && appReady && authStatusValue !== "loading";

    opacity.value = withTiming(status ? 0 : 1, { duration: 500 });
  }, [animationReady, appReady, authStatusValue]);

  // Fires animation signal after image loading.
  const onImageLoaded = useCallback(async () => {
    setTimeout(() => {
      SplashScreen.hideAsync().then(() => {
        setAnimationReady(true);
      });
    }, 250);
  }, []);

  return (
    <>
      {appReady && <RootLayoutNav linking={linking} setLinking={setLinking} />}

      <Animated.View
        pointerEvents={appReady ? "none" : undefined}
        style={{
          display: appReady && opacity.value === 0 ? "none" : "flex",
          position: "absolute",
          opacity: opacity,
          width,
          height,
          backgroundColor: "black",
          zIndex: 1,
        }}
      >
        <Image
          contentFit="contain"
          style={{
            flex: 1,
          }}
          source={require("@/assets/images/splash.png")}
          onLoad={onImageLoaded}
        />
      </Animated.View>
    </>
  );
}

export default RootLayout;
