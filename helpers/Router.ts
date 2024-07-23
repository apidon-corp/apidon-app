import { router } from "expo-router";

export default function resetNavigationHistory() {
  if (router.canGoBack()) router.dismissAll();

  while (router.canGoBack()) {
    router.back();
  }
  router.replace("/");
}
