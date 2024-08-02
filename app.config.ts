import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: process.env.APP_NAME || "ApidonDevelopment",
  slug: process.env.APP_SLUG || "apidon-app-dev",
  version: process.env.APP_VERSION || "1.0.6",
  orientation: "portrait",
  icon: process.env.APP_ICON || "./assets/images/iconDev.png",
  scheme: process.env.APP_SCHEME || "apidon-development",
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
    bundleIdentifier:
      process.env.IOS_BUNDLE_INDENTIFER || "com.abovestars.dev.apidon",
    googleServicesFile:
      process.env.GOOGLE_SERVICES_FILE_APPLE ||
      "./Development-LocalPreview-GoogleService-Info.plist",
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
    ["@react-native-firebase/crashlytics"],
    ["./helpers/customPlugins/DisableAdIdForAnalytics.js"],
    ["expo-apple-authentication"],
    ["@react-native-firebase/perf"],
    [
      "expo-build-properties",
      {
        ios: {
          useFrameworks: "static",
        },
      },
    ],
    "./helpers/customPlugins/AppCheckPlugin.js",
  ],
  experiments: {
    typedRoutes: false,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: "fb6da820-d5c1-4658-9bce-7e125525e0cc",
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
