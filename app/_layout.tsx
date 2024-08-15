import "expo-dev-client";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import AuthProvider from "@/providers/AuthProvider";
import { Alert, Dimensions, Linking, StatusBar, View } from "react-native";

import NotificationProvider from "@/providers/NotificationProvider";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

import useAppCheck from "@/hooks/useAppCheck";
import { Image } from "expo-image";
import useCheckUpdate from "@/hooks/useCheckUpdate";

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
};

function RootLayoutNav({ linking }: Props) {
  return (
    <AuthProvider linking={linking}>
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
  const { width: screenWidth } = Dimensions.get("screen");
  const width = screenWidth / 4.16;

  return (
    <View
      style={{
        width: "100%",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image
        source={require("@/assets/images/logo.png")}
        style={{
          width: width,
          height: width,
        }}
      />
    </View>
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

  const [linking, setLinking] = useState<{
    isInitial: boolean;
    url: string;
  }>({
    isInitial: true,
    url: "",
  });

  useEffect(() => {
    // Handle the initial URL if the app is opened via a Universal Link
    const handleInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();

      let timeStampedURL = "";
      if (initialUrl) timeStampedURL = initialUrl + "/" + Date.now().toString();

      setLinking({
        isInitial: true,
        url: timeStampedURL,
      });
    };

    handleInitialURL();

    // Listen for incoming URLs when the app is already open
    const subscription = Linking.addEventListener("url", (event) => {
      const url = event.url;

      let timeStampedURL = "";
      if (url) timeStampedURL = url + "/" + Date.now().toString();

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

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded || !appCheckLoaded || versionStatus === "loading") {
    return <PlaceholderForWaiting />;
  }

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
      "New update available",
      "Please update the app to continue using it.",
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

  return <RootLayoutNav linking={linking} />;
}

export default RootLayout;
