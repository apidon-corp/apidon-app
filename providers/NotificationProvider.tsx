import { NotificationDocData } from "@/types/Notification";
import {
  adjustNotificationSettings,
  makeDeviceReadyToGetNotifications,
  resetNotificationBadge,
} from "@/utils/notificationHelpers";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";
import { useAuth } from "./AuthProvider";

const NotificationContext = createContext<NotificationDocData | null>(null);

const NotificationProvider = ({ children }: PropsWithChildren) => {
  const authStatus = useAuth();

  const [notificationDocData, setNotificationDocData] =
    useState<NotificationDocData | null>(null);

  // Notification Data Fetching
  useEffect(() => {
    const displayName = auth().currentUser?.displayName;
    if (!displayName) return setNotificationDocData(null);

    const notificationDocPath = `users/${displayName}/notifications/notifications`;

    const unsubscribe = firestore()
      .doc(notificationDocPath)
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) {
            console.log("No notification doc found.");
            return setNotificationDocData(null);
          }

          const notificationDocData = snapshot.data() as NotificationDocData;

          const notificationsFetched = notificationDocData.notifications;

          notificationsFetched.sort((a, b) => b.timestamp - a.timestamp);

          return setNotificationDocData({
            lastOpenedTime: notificationDocData.lastOpenedTime,
            notifications: notificationsFetched,
            notificationToken: notificationDocData.notificationToken,
          });
        },
        (error) => {
          console.error("Error on getting notification data: ", error);
          return setNotificationDocData(null);
        }
      );

    return () => unsubscribe();
  }, [authStatus]);

  useEffect(() => {
    if (authStatus === "authenticated") {
      if (auth().currentUser?.displayName) {
        makeDeviceReadyToGetNotifications();
        adjustNotificationSettings();
      }
    }
  }, [authStatus]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    resetNotificationBadge();
    if (nextAppState === "active") {
      adjustNotificationSettings(true);
    } else {
      adjustNotificationSettings(false);
    }
  };

  return (
    <NotificationContext.Provider value={notificationDocData}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);

export default NotificationProvider;
