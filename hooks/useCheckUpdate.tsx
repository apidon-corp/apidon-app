import firestore from "@react-native-firebase/firestore";
import Constants from "expo-constants";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import useAppCheck from "./useAppCheck";
import { VersionConfigDocData } from "@/types/Config";

const useCheckUpdate = () => {
  const [versionStatus, setVersionStatus] = useState<
    "loading" | "hasLatestVersion" | "updateNeeded"
  >("loading");

  const appCheckLoaded = useAppCheck();

  useEffect(() => {
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
            Alert.alert(
              "Update Available",
              "Please update the app to the latest version."
            );
            setVersionStatus("updateNeeded");
          }
        },
        (error) => {
          console.error("Error: ", error);
          setVersionStatus("loading");
        }
      );
    return () => unsubscribe();
  }, [appCheckLoaded]);

  return {
    versionStatus,
  };
};

export default useCheckUpdate;
