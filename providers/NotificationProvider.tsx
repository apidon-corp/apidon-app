import { NotificationsDocData } from "@/types/Notification";
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

const NotificationContext = createContext<{
  notificationsDocData: NotificationsDocData | null;
  haveUnread: boolean;
}>({
  notificationsDocData: null,
  haveUnread: false,
});

const NotificationProvider = ({ children }: PropsWithChildren) => {
  const { authStatus } = useAuth();

  const [notificationsDocData, setNotificationsDocData] =
    useState<NotificationsDocData | null>(null);

  const [haveUnread, setHaveUnread] = useState(false);

  // Notifications Doc Fetching - Realtime
  useEffect(() => {
    if (authStatus !== "authenticated") return setNotificationsDocData(null);

    const displayName = auth().currentUser?.displayName;
    if (!displayName) return setNotificationsDocData(null);

    const notificationDocPath = `users/${displayName}/notifications/notifications`;

    const unsubscribe = firestore()
      .doc(notificationDocPath)
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) {
            console.log("No notification doc found.");
            return setNotificationsDocData(null);
          }

          setNotificationsDocData(snapshot.data() as NotificationsDocData);
        },
        (error) => {
          console.error("Error on getting notification data: ", error);
          return setNotificationsDocData(null);
        }
      );

    return () => unsubscribe();
  }, [authStatus]);

  // Handling Unread Notifications for badge on bottom-bar navigation.
  useEffect(() => {
    if (!authStatus) return;

    const displayName = auth().currentUser?.displayName;
    if (!displayName) return setHaveUnread(false);

    if (!notificationsDocData) return setHaveUnread(false);

    const unsubscribe = firestore()
      .collection(
        `users/${displayName}/notifications/notifications/receivedNotifications`
      )
      .where("timestamp", ">", notificationsDocData.lastOpenedTime)
      .limit(1)
      .onSnapshot(
        (snapshot) => {
          return setHaveUnread(snapshot.size > 0);
        },
        (error) => {
          console.error("Error on getting received notifications: ", error);
          return setHaveUnread(false);
        }
      );
    return () => unsubscribe();
  }, [authStatus, notificationsDocData]);

  // Initial notification managing
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
    <NotificationContext.Provider
      value={{
        notificationsDocData,
        haveUnread: haveUnread,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);

export default NotificationProvider;
