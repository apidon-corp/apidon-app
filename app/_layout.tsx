import "expo-dev-client";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, router, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SetStateAction, useEffect, useRef, useState } from "react";
import "react-native-reanimated";

import AuthProvider from "@/providers/AuthProvider";
import { Alert, Linking, StatusBar, View } from "react-native";

import NotificationProvider from "@/providers/NotificationProvider";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

import useAppCheck from "@/hooks/useAppCheck";
import useCheckUpdate from "@/hooks/useCheckUpdate";
import { Image } from "expo-image";
import useCheckInternet from "@/hooks/useCheckInternet";
import CustomBottomModalSheet from "@/components/BottomSheet/CustomBottomModalSheet";
import Text from "@/components/Text/Text";

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

function PlaceholderForWaiting() {
  return (
    <Image source={require("@/assets/images/splash.png")} style={{ flex: 1 }} />
  );
}

function RootLayout() {
  const [loaded, error] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    ...FontAwesome.font,
  });

  const appCheckLoaded = useAppCheck();

  const { versionStatus } = useCheckUpdate();

  const { isConnected } = useCheckInternet();

  const networkErrorBottomSheetModalRef = useRef<BottomSheetModal>(null);

  const [linking, setLinking] = useState<{
    isInitial: boolean;
    url: string;
  }>({
    isInitial: true,
    url: "",
  });

  const pathname = usePathname();

  // Linking
  useEffect(() => {
    // Handle the initial URL if the app is opened via a Universal Link
    const handleInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();

      if (!initialUrl) return;

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

  // Splash Screen
  useEffect(() => {
    if (
      loaded &&
      appCheckLoaded &&
      versionStatus === "hasLatestVersion" &&
      pathname !== "/"
    ) {
      SplashScreen.hideAsync();
    }
  }, [loaded, appCheckLoaded, versionStatus, pathname]);

  if (versionStatus === "error") {
    Alert.alert(
      "Error on checking updates",
      "Please try again later",
      [
        {
          text: "OK",
          onPress: () => {},
        },
      ],
      { cancelable: false }
    );
    return <PlaceholderForWaiting />;
  }

  if (versionStatus === "updateNeeded") {
    Alert.alert(
      "Update Available",
      "Please update the app to the latest version.",
      [
        {
          text: "OK",
          onPress: () => {},
        },
      ],
      { cancelable: false }
    );
    return <PlaceholderForWaiting />;
  }

  if (!isConnected) {
    if (networkErrorBottomSheetModalRef.current)
      networkErrorBottomSheetModalRef.current.present();

    return (
      <>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <BottomSheetModalProvider>
            <CustomBottomModalSheet
              backgroundColor="#1B1B1B"
              locked
              ref={networkErrorBottomSheetModalRef}
            >
              <View style={{ flex: 1, gap: 15, padding: 10 }}>
                <Text fontSize={18} bold>
                  Check Your Connection
                </Text>
                <Text fontSize={13}>
                  It seems that you are not connected to the internet. Please
                  check your internet connection and try again.
                </Text>
              </View>
            </CustomBottomModalSheet>
            <PlaceholderForWaiting />
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </>
    );
  }

  return <RootLayoutNav linking={linking} setLinking={setLinking} />;
}

export default RootLayout;
