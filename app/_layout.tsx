import "expo-dev-client";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useNavigationContainerRef } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import "react-native-reanimated";

import AuthProvider from "@/providers/AuthProvider";
import { Linking, StatusBar } from "react-native";

import NotificationProvider from "@/providers/NotificationProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

import { StripeProvider, useStripe } from "@stripe/stripe-react-native";

import appCheck from "@react-native-firebase/app-check";

import * as Device from "expo-device";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

import * as Sentry from "@sentry/react-native";
import { isRunningInExpoGo } from "expo";

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
              <StripeProvider
                publishableKey={
                  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
                }
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
              </StripeProvider>
            </GestureHandlerRootView>
          </ThemeProvider>
        </NotificationProvider>
      </AuthProvider>
    </>
  );
}

function RootLayout() {
  const [loaded, error] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    ...FontAwesome.font,
  });

  const [appCheckLoaded, setAppCheckLoaded] = useState(false);

  useEffect(() => {
    handleConnectAppCheckServers();
  }, []);

  const handleConnectAppCheckServers = async () => {
    try {
      const provider = appCheck().newReactNativeFirebaseAppCheckProvider();

      provider.configure({
        apple: {
          provider: Device.isDevice
            ? "appAttestWithDeviceCheckFallback"
            : "debug",
          debugToken: process.env.EXPO_PUBLIC_DEBUG_TOKEN,
        },
      });

      await appCheck().initializeAppCheck({
        provider: provider,
        isTokenAutoRefreshEnabled: true,
      });

      const { token } = await appCheck().getToken();

      if (token.length > 0) {
        setAppCheckLoaded(true);
      } else {
        setAppCheckLoaded(false);
      }
    } catch (error) {
      Sentry.captureException(
        `Error on connecting and creating app check token: \n ${error}`
      );
      console.error(
        "Error on connecting and creating app check token: ",
        error
      );
      setAppCheckLoaded(false);
    }
  };

  const { handleURLCallback } = useStripe();
  const handleDeepLink = useCallback(
    async (url: string | null) => {
      if (url) {
        const stripeHandled = await handleURLCallback(url);
        if (stripeHandled) {
          // This was a Stripe URL - you can return or add extra handling here as you see fit
        } else {
          // This was NOT a Stripe URL – handle as you normally would
        }
      }
    },
    [handleURLCallback]
  );
  useEffect(() => {
    const getUrlAsync = async () => {
      const initialUrl = await Linking.getInitialURL();
      handleDeepLink(initialUrl);
    };

    getUrlAsync();

    const deepLinkListener = Linking.addEventListener(
      "url",
      (event: { url: string }) => {
        handleDeepLink(event.url);
      }
    );

    return () => deepLinkListener.remove();
  }, [handleDeepLink]);

  const ref = useNavigationContainerRef();
  useEffect(() => {
    if (ref) {
      routingInstrumentation.registerNavigationContainer(ref);
    }
  }, [ref]);

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

  if (!appCheckLoaded) {
    return null;
  }

  return <RootLayoutNav />;
}

export default Sentry.wrap(RootLayout);
