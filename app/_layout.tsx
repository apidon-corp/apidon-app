import "expo-dev-client";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useNavigationContainerRef } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import AuthProvider from "@/providers/AuthProvider";
import { Dimensions, StatusBar, View } from "react-native";

import NotificationProvider from "@/providers/NotificationProvider";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import * as Device from "expo-device";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

import useAppCheck from "@/hooks/useAppCheck";
import * as Sentry from "@sentry/react-native";
import { isRunningInExpoGo } from "expo";
import { Image } from "expo-image";

const routingInstrumentation = new Sentry.ReactNavigationInstrumentation();

Sentry.init({
  dsn: Device.isDevice ? process.env.EXPO_PUBLIC_SENTRY_DSN : "",
  debug: false, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
  integrations: [
    new Sentry.ReactNativeTracing({
      // Pass instrumentation to be used as `routingInstrumentation`
      routingInstrumentation,
      enableNativeFramesTracking: !isRunningInExpoGo(),
      // ...
    }),
  ],
});

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "index",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <>
      <AuthProvider>
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
    </>
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

  const ref = useNavigationContainerRef();
  useEffect(() => {
    if (ref) {
      routingInstrumentation.registerNavigationContainer(ref);
    }
  }, [ref]);

  const appCheckLoaded = true; //useAppCheck();

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return <PlaceholderForWaiting />;
  }
  if (!appCheckLoaded) {
    return <PlaceholderForWaiting />;
  }

  return <RootLayoutNav />;
}

export default Sentry.wrap(RootLayout);
