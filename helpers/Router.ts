import { router } from "expo-router";

export default function resetNavigationHistory() {
  // Wait for the next frame to ensure root layout is mounted
  setTimeout(() => {
    try {
      if (router.canGoBack()) {
        router.replace("/");
      }
    } catch (error) {
      console.warn("Navigation error:", error);
    }
  }, 0);
}