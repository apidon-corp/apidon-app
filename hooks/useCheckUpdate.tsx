import firestore from "@react-native-firebase/firestore";
import Constants from "expo-constants";
import { useEffect, useRef, useState } from "react";
import { Alert, Linking, Platform } from "react-native";
import useAppCheck from "./useAppCheck";
import { VersionConfigDocData } from "@/types/Config";

const TRY_COUNT = 3;
const TRY_GAP_MS = 1000;

const useCheckUpdate = () => {
  const [versionStatus, setVersionStatus] = useState<
    "loading" | "hasLatestVersion" | "updateNeeded"
  >("loading");

  const appCheckLoaded = useAppCheck();

  const tryCount = useRef(0);
  const [initialCheckFinished, setIntialCheckFinished] = useState(false);

  const [isAlertOnForeground, setIsAlertOnForeground] = useState(false);

  const redirectToStore = () => {
    const appStoreUrl =
      "https://apps.apple.com/app/apidon-make-events-unique/id6737543465";
    const playStoreUrl =
      "https://play.google.com/apps/testing/com.abovestars.prod.apidon";

    const storeUrl = Platform.select({
      ios: appStoreUrl,
      android: playStoreUrl,
    });

    if (!storeUrl) return;

    Linking.openURL(storeUrl).catch((err) =>
      console.error("Failed to open URL:", err)
    );
  };

  const checkVersionInitially = async () => {
    if (!appCheckLoaded) return setVersionStatus("loading");

    setVersionStatus("loading");

    try {
      const snapshot = await firestore().doc("config/version").get();
      if (!snapshot.exists) throw new Error("No version data found");

      const availableVersions = (snapshot.data() as VersionConfigDocData)
        .availableVersions;

      const currentVersion = Constants.expoConfig?.version;
      if (!currentVersion) throw new Error("No version found");

      const isDeviceVersionAvailable =
        availableVersions.includes(currentVersion);

      if (isDeviceVersionAvailable) {
        setVersionStatus("hasLatestVersion");
        setIntialCheckFinished(true);
      } else {
        throw new Error("Update needed");
      }
    } catch (error) {
      if (tryCount.current < TRY_COUNT) {
        tryCount.current++;
        console.log(
          "Retrying to check updates initially for the ",
          tryCount.current,
          ". time"
        );
        setTimeout(checkVersionInitially, TRY_GAP_MS);
      } else {
        console.error("Error on checking updates initially:  ", error);
        setVersionStatus("updateNeeded");
        setIntialCheckFinished(true);
      }
    }
  };

  const showAlert = () => {
    if (isAlertOnForeground) return;

    setIsAlertOnForeground(true);

    Alert.alert(
      "Update Available",
      "Please update the app to the latest version.",
      [
        {
          text: "Update",
          onPress: () => {
            setIsAlertOnForeground(false);
            redirectToStore();
          },
        },
      ]
    );
  };

  useEffect(() => {
    if (appCheckLoaded) checkVersionInitially();
  }, [appCheckLoaded]);

  useEffect(() => {
    if (!initialCheckFinished) return;
    if (!appCheckLoaded) return setVersionStatus("loading");

    setVersionStatus("loading");

    const unsubscribe = firestore()
      .doc("config/version")
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) return setVersionStatus("loading");

          const availableVersions = (snapshot.data() as VersionConfigDocData)
            .availableVersions;

          const currentVersion = Constants.expoConfig?.version;
          if (!currentVersion) return setVersionStatus("loading");

          if (availableVersions.includes(currentVersion)) {
            setVersionStatus("hasLatestVersion");
          } else {
            setVersionStatus("updateNeeded");
          }
        },
        (error) => {
          console.error("Error: ", error);
          setVersionStatus("loading");
        }
      );
    return () => unsubscribe();
  }, [appCheckLoaded, initialCheckFinished]);

  useEffect(() => {
    if (versionStatus === "updateNeeded") {
      showAlert();
    }
  }, [versionStatus]);

  return {
    versionStatus,
  };
};

export default useCheckUpdate;
