import NotificationItem from "@/components/Notification/NotificationItem";
import apiRoutes from "@/helpers/ApiRoutes";
import { useNotification } from "@/providers/NotificationProvider";
import { usePathname } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, NativeScrollEvent, ScrollView } from "react-native";

import auth from "@react-native-firebase/auth";
import appCheck from "@react-native-firebase/app-check";
import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";

import { ReceivedNotificationDocData } from "@/types/Notification";

const notifications = () => {
  const { notificationsDocData } = useNotification();
  const pathName = usePathname();

  const scrollViewRef = useRef<ScrollView>(null);

  const [receivedNotificationDocs, setReceivedNotificationDocs] = useState<
    FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>[]
  >([]);

  // Handling updating last opened time.
  useEffect(() => {
    if (pathName === "/home/notifications") updateLastOpenedTime();
  }, [pathName]);

  // Handle Realtime Notification Fetching
  useEffect(() => {
    const displayName = auth().currentUser?.displayName;
    if (!displayName) return;

    const unsubscribe = firestore()
      .collection(
        `users/${displayName}/notifications/notifications/receivedNotifications`
      )
      .orderBy("timestamp", "desc")
      .limit(10)
      .onSnapshot(
        (snaphot) => {
          setReceivedNotificationDocs(snaphot.docs);
        },
        (error) => {
          console.error("Error on getting received notifications: ", error);
        }
      );
    return () => unsubscribe();
  }, []);

  const updateLastOpenedTime = async () => {
    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return console.error("User not found");

    try {
      const idToken = await currentUserAuthObject.getIdToken();

      const { token: appchecktoken } = await appCheck().getLimitedUseToken();

      const response = await fetch(
        apiRoutes.user.notification.updateLastOpenedTime,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${idToken}`,
            appchecktoken,
          },
        }
      );

      if (!response.ok) {
        return console.error(
          "Response from updateLastOpenedTime API is not okay: ",
          await response.text()
        );
      }

      return;
    } catch (error) {
      return console.error("Error on updating last opened time: ", error);
    }
  };

  const handleScroll = (event: NativeScrollEvent) => {
    const threshold = 250;

    const { layoutMeasurement, contentOffset, contentSize } = event;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - threshold;
    if (isCloseToBottom) {
      serveMoreNotifications();
    }
  };

  const serveMoreNotifications = async () => {
    const displayName = auth().currentUser?.displayName;
    if (!displayName) return;

    const lastDoc =
      receivedNotificationDocs[receivedNotificationDocs.length - 1];
    if (!lastDoc) return;

    try {
      const querySnapshot = await firestore()
        .collection(
          `users/${displayName}/notifications/notifications/receivedNotifications`
        )
        .orderBy("timestamp", "desc")
        .startAfter(lastDoc)
        .limit(10)
        .get();
      const newDocs = querySnapshot.docs;
      setReceivedNotificationDocs((prev) => [...prev, ...newDocs]);
    } catch (error) {
      console.error("Error on serving more notifications: ", error);
    }
  };

  if (!notificationsDocData) return <></>;

  return (
    <ScrollView
      ref={scrollViewRef}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      onScroll={({ nativeEvent }) => handleScroll(nativeEvent)}
      scrollEventThrottle={500}
    >
      <FlatList
        scrollEnabled={false}
        contentContainerStyle={{
          paddingVertical: 10,
          paddingHorizontal: 10,
          gap: 10,
        }}
        data={Array.from(new Set(receivedNotificationDocs)).map(
          (f) => f.data() as ReceivedNotificationDocData
        )}
        renderItem={({ item }) => (
          <NotificationItem
            receivedNotificationDocData={item}
            lastOpenedTime={notificationsDocData.lastOpenedTime}
            key={`${item.source}-${item.type}-${item.timestamp}`}
          />
        )}
        keyExtractor={(item) => `${item.source}-${item.type}-${item.timestamp}`}
        showsVerticalScrollIndicator={false}
      />
    </ScrollView>
  );
};

export default notifications;
