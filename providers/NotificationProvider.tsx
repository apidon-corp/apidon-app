import { auth, firestore } from "@/firebase/client";
import { NotificationDocData } from "@/types/Notification";
import { doc, onSnapshot } from "firebase/firestore";
import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthProvider";

const NotificationContext = createContext<NotificationDocData | null>(null);

const NotificationProvider = ({ children }: PropsWithChildren) => {
  const authStatus = useAuth();

  const [notificationDocData, setNotificationDocData] =
    useState<NotificationDocData | null>(null);

  // Notification Data Fetching
  useEffect(() => {
    const displayName = auth.currentUser?.displayName;
    if (!displayName) return setNotificationDocData(null);

    const notificationDocPath = `/users/${displayName}/notifications/notifications`;

    const notificationDocRef = doc(firestore, notificationDocPath);

    const unsubscribe = onSnapshot(
      notificationDocRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          console.log("No notification doc found.");
          return setNotificationDocData(null);
        }

        const notificationDocData = snapshot.data() as NotificationDocData;

        const notificationsFetched = notificationDocData.notifications;

        notificationsFetched.sort((a, b) => b.ts - a.ts);

        return setNotificationDocData({
          lastOpenedTime: notificationDocData.lastOpenedTime,
          notifications: notificationsFetched,
        });
      },
      (error) => {
        console.error("Error on getting notification data: ", error);
        return setNotificationDocData(null);
      }
    );

    return () => unsubscribe();
  }, [authStatus]);

  return (
    <NotificationContext.Provider value={notificationDocData}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);

export default NotificationProvider;
