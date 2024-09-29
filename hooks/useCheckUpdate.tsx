import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import Constants from "expo-constants";
import { useEffect, useState } from "react";
import useAppCheck from "./useAppCheck";
import { Alert } from "react-native";

const useCheckUpdate = () => {
  const [versionStatus, setVersionStatus] = useState<
    "loading" | "hasLatestVersion" | "updateNeeded"
  >("loading");

  const appCheckLoaded = useAppCheck();

  useEffect(() => {
    const currentUser = auth().currentUser?.displayName || "";
    if (!currentUser) return setVersionStatus("loading");

    if (!appCheckLoaded) return setVersionStatus("loading");

    setVersionStatus("loading");

    const unsubscribe = firestore()
      .doc("config/version")
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) return setVersionStatus("loading");

          const availableVersions = (snapshot.data() as VersionDocData)
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
          setVersionStatus("loading");
        }
      );
    return () => {
      unsubscribe();
    };
  }, [appCheckLoaded]);

  return {
    versionStatus,
  };
};

export default useCheckUpdate;
