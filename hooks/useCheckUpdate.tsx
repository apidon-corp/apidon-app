import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import Constants from "expo-constants";
import { useEffect, useState } from "react";
import useAppCheck from "./useAppCheck";

const useCheckUpdate = () => {
  const [versionStatus, setVersionStatus] = useState<
    "loading" | "error" | "hasLatestVersion" | "updateNeeded"
  >("loading");

  const appCheckLoaded = useAppCheck();

  useEffect(() => {
    const currentUser = auth().currentUser?.displayName || "";
    if (!currentUser) return setVersionStatus("loading");

    if (!appCheckLoaded) return setVersionStatus("loading");

    const unsubscribe = firestore()
      .doc("config/version")
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) return setVersionStatus("error");

          const availableVersions = (snapshot.data() as VersionDocData)
            .availableVersions;

          const currentVersion = Constants.expoConfig?.version;
          if (!currentVersion) return setVersionStatus("error");

          if (availableVersions.includes(currentVersion)) {
            setVersionStatus("hasLatestVersion");
          } else {
            setVersionStatus("updateNeeded");
          }
        },
        (error) => {
          setVersionStatus("error");
        }
      );
    return () => {
      unsubscribe();
    };
  }, [appCheckLoaded, auth().currentUser]);

  return {
    versionStatus,
  };
};

export default useCheckUpdate;
