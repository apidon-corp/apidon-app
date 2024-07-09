import NotificationItem from "@/components/Notification/NotificationItem";
import { auth } from "@/firebase/client";
import apiRoutes from "@/helpers/ApiRoutes";
import { useNotification } from "@/providers/NotificationProvider";
import { usePathname } from "expo-router";
import React, { useEffect } from "react";
import { FlatList, SafeAreaView } from "react-native";

const notifications = () => {
  const notificationDocData = useNotification();
  const pathName = usePathname();

  const updateLastOpenedTime = async () => {
    const currentUserAuthObject = auth.currentUser;
    if (!currentUserAuthObject) return console.error("User not found");

    try {
      const idToken = await currentUserAuthObject.getIdToken();
      const response = await fetch(
        apiRoutes.user.notification.updateLastOpenedTime,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${idToken}`,
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
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        contentContainerStyle={{
          paddingVertical: 10,
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
    </SafeAreaView>
  );
};

export default notifications;
