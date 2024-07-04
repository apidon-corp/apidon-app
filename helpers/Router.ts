import { router } from "expo-router";

export default function resetNavigationHistory() {
  while (router.canGoBack()) {
    router.back();
  }
  router.replace("/");
}
