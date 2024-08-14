import NotificationItem from "@/components/Notification/NotificationItem";
import apiRoutes from "@/helpers/ApiRoutes";
import { useNotification } from "@/providers/NotificationProvider";
import { usePathname } from "expo-router";
import React, { useEffect } from "react";
import { FlatList, ScrollView } from "react-native";

import auth from "@react-native-firebase/auth";

import appCheck from "@react-native-firebase/app-check";

const notifications = () => {
  const notificationDocData = useNotification();
  const pathName = usePathname();

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

  useEffect(() => {
    if (pathName === "/home/notifications") updateLastOpenedTime();
  }, [pathName]);

  if (!notificationDocData) return <></>;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <FlatList
        scrollEnabled={false}
        contentContainerStyle={{
          paddingVertical: 10,
          paddingHorizontal: 10,
          gap: 10,
        }}
        data={notificationDocData.notifications}
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
