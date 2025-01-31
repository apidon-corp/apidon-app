import { router } from "expo-router";

export default function resetNavigationHistoryWithNewPath(newPath: string) {
  while (router.canGoBack()) {
    // Pop from stack until one element is left
    router.back();
  }
  router.replace(newPath); // Replace the last remaining stack element
}
