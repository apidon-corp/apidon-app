import Constants from "expo-constants";
import { useEffect, useRef, useState } from "react";
import crashlytics from "@react-native-firebase/crashlytics";
import firestore from "@react-native-firebase/firestore";
import useAppCheck from "./useAppCheck";

const MAX_RETRIES = 5;
const RETRY_DELAY = 3000;

const useCheckUpdate = () => {
  const [versionStatus, setVersionStatus] = useState<
    "loading" | "error" | "hasLatestVersion" | "updateNeeded"
  >("loading");

  const appCheckLoaded = useAppCheck();

  const retryCountRef = useRef(0);

  const checkForUpdates = async (
    retryCountRef: React.MutableRefObject<number>
  ) => {
    setVersionStatus("loading");

    const currentVersion = Constants.expoConfig?.version;

    if (!currentVersion) {
      console.error("Current version is not defined");
      crashlytics().recordError(
        new Error("Current version is not defined on checking for new udates.")
      );
      return setVersionStatus("error");
    }

    let latestVersion: string;

    try {
      const versionDocSnapshot = await firestore().doc(`config/version`).get();

      if (!versionDocSnapshot.exists) {
        console.error("Version document does not exist");
        crashlytics().recordError(
          new Error(
            "Version document does not exist on checking for new udates."
          )
        );
        return setVersionStatus("error");
      }

      const versionDocData = versionDocSnapshot.data() as VersionDocData;

      if (!versionDocData) {
        console.error("Version document data is not defined");
        crashlytics().recordError(
          new Error(
            "Version document data is not defined on checking for new udates."
          )
        );
        return setVersionStatus("error");
      }

      latestVersion = versionDocData.latestVersion || "";

      if (!latestVersion) {
        console.error("Latest version is not defined");
        crashlytics().recordError(
          new Error("Latest version is not defined on checking for new udates.")
        );
        return setVersionStatus("error");
      }

      if (currentVersion === latestVersion) {
        return setVersionStatus("hasLatestVersion");
      } else if (currentVersion < latestVersion) {
        return setVersionStatus("updateNeeded");
      } else {
        console.error(
          "Current version (on device) is greater than the latest version (from database)."
        );
        crashlytics().recordError(
          new Error(
            "Current version (on device) is greater than the latest version (from database) on checking for new udates."
          )
        );
        return setVersionStatus("error");
      }
    } catch (error) {
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current++;
        setTimeout(() => {
          checkForUpdates(retryCountRef);
        }, RETRY_DELAY);
      } else {
        console.error("Error on checking for new udates:", error);
        crashlytics().recordError(
          new Error("Error on checking for new udates:" + error)
        );
        return setVersionStatus("error");
      }
    }
  };

  useEffect(() => {
    if (appCheckLoaded) checkForUpdates(retryCountRef);
  }, [appCheckLoaded, retryCountRef]);

  return {
    versionStatus,
  };
};

export default useCheckUpdate;
