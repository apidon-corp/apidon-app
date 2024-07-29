import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Apidon-Dev",
  slug: "apidon-app-dev",
  version: "1.0.6",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "apidon",
  userInterfaceStyle: "dark",
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#000000",
  },
  ios: {
    config: {
      usesNonExemptEncryption: false,
    },
    usesAppleSignIn: true,
    supportsTablet: false,
    bundleIdentifier: "com.abovestars.dev.apidon",
    googleServicesFile:
      process.env.APIDON_USER_GOOGL_SERVICE_INFO_PLIST ||
      "./GoogleService-info.plist",
  },
  plugins: [
    "expo-router",
    [
      "expo-font",
      {
        fonts: [
          "./assets/fonts/Poppins-Regular.ttf",
          "./assets/fonts/Poppins-Bold.ttf",
        ],
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "The app accesses your photos to let you share them with your friends.",
      },
    ],
    "@react-native-firebase/app",
    ["@react-native-google-signin/google-signin"],
    ["expo-apple-authentication"],
    [
      "expo-build-properties",
      {
        ios: {
          useFrameworks: "static",
        },
      },
    ],
    "./helpers/customPlugins/AppCheckPlugin.js",
    [
      "@sentry/react-native/expo",
      {
        organization: process.env.EXPO_PUBLIC_SENTRY_ORG,
        project: process.env.EXPO_PUBLIC_SENTRY_PROJECT,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: "0d348ab7-ab83-4fbc-8f26-98b5b600919b",
    },
  },
  owner: "abovestars",
  runtimeVersion: {
    policy: "appVersion",
  },
  updates: {
    url: "https://u.expo.dev/0d348ab7-ab83-4fbc-8f26-98b5b600919b",
  },
});
