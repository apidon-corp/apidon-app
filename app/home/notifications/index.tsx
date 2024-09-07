import NotificationItem from "@/components/Notification/NotificationItem";
import apiRoutes from "@/helpers/ApiRoutes";
import { useNotification } from "@/providers/NotificationProvider";
import { usePathname } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, NativeScrollEvent, ScrollView } from "react-native";

import auth from "@react-native-firebase/auth";

import appCheck from "@react-native-firebase/app-check";
import { NotificationData } from "@/types/Notification";

const notifications = () => {
  const notificationDocData = useNotification();
  const pathName = usePathname();

  const [servedNotifications, setServedNotifications] = useState<
    NotificationData[]
  >([]);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (pathName === "/home/notifications") updateLastOpenedTime();
  }, [pathName]);

  useEffect(() => {
    if (!notificationDocData) return setServedNotifications([]);
    setServedNotifications(notificationDocData.notifications.slice(0, 8));
  }, [notificationDocData?.notifications.length]);

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

  const handleServeMoreNotifications = () => {
    if (!notificationDocData) return setServedNotifications([]);

    if (servedNotifications.length === notificationDocData.notifications.length)
      return;

    if (servedNotifications.length === 0) {
      return setServedNotifications(
        notificationDocData.notifications.slice(0, 8)
      );
    }

    setServedNotifications((prev) => {
      return [
        ...prev,
        ...notificationDocData.notifications.slice(
          prev.length,
          prev.length + 4
        ),
      ];
    });
  };

  const handleScroll = (event: NativeScrollEvent) => {
    const threshold = 0;

    const { layoutMeasurement, contentOffset, contentSize } = event;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - threshold;
    if (isCloseToBottom) handleServeMoreNotifications();
  };

  if (!notificationDocData) return <></>;

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
        data={servedNotifications}
        renderItem={({ item }) => (
          <NotificationItem
            notificationData={item}
            lastOpenedTime={notificationDocData.lastOpenedTime}
            key={`${item.source}- ${item.timestamp}`}
          />
        )}
        keyExtractor={(item) => `${item.source}-${item.type}-${item.timestamp}`}
        showsVerticalScrollIndicator={false}
      />
    </ScrollView>
  );
};

export default notifications;
