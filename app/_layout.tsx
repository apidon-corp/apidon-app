import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import AuthProvider from "@/providers/AuthProvider";
import { StatusBar } from "react-native";

import NotificationProvider from "@/providers/NotificationProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "index",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    ...FontAwesome.font,
  });

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
    return null;
  }

  return <RootLayoutNav />;
}

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
              <Stack>
                <Stack.Screen
                  name="(modals)"
                  options={{
                    headerShown: false,
                    presentation: "modal",
                  }}
                />
                <Stack.Screen
                  name="index"
                  options={{
                    title: "Index",
                    headerShown: false,
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
                  name="+not-found"
                  options={{
                    title: "Not Found",
                  }}
                />
              </Stack>
            </GestureHandlerRootView>
          </ThemeProvider>
        </NotificationProvider>
      </AuthProvider>
    </>
  );
}
