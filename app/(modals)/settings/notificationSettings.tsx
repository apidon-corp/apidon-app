import { ActivityIndicator, Alert, Pressable, View } from "react-native";

import { Text } from "@/components/Text/Text";
import { NotificationSettingsDocData } from "@/types/Notification";
import React, { useEffect, useState } from "react";

import { useAuth } from "@/providers/AuthProvider";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

import {
  createExpoPushToken,
  updateNotificationTokenOnFirebase,
} from "@/utils/notificationHelpers";

import Linking from "expo-linking";

const notificationSettings = () => {
  const { authStatus } = useAuth();

  const [notificationSettingsData, setNotificationSettingsData] =
    useState<null | NotificationSettingsDocData>(null);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      console.error(
        "User is not authenticated to retrive notificationSettings doc."
      );
      return setNotificationSettingsData(null);
    }

    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject || !currentUserAuthObject.displayName) {
      console.error(
        "User is not authenticated to retrive notificationSettings doc."
      );
      return setNotificationSettingsData(null);
    }

    const unsubscribe = firestore()
      .doc(
        `users/${currentUserAuthObject.displayName}/notifications/notificationSettings`
      )
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            setNotificationSettingsData(
              doc.data() as NotificationSettingsDocData
            );
          } else {
            console.error("Notification settings doc does not exist.");
            setNotificationSettingsData(null);
          }
        },
        (error) => {
          console.error("Error getting notification settings doc: ", error);
          setNotificationSettingsData(null);
        }
      );

    return () => unsubscribe();
  }, [authStatus]);

  const handleSetNotificationsButton = async () => {
    // Android specific adjusting for channel.
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    const isRealDevice = Device.isDevice;

    if (!isRealDevice) {
      console.log("Only real devices can subscribe to push notifications.");
      return false;
    }

    const currentNotificationStatus = await Notifications.getPermissionsAsync();

    if (
      currentNotificationStatus.granted &&
      currentNotificationStatus.canAskAgain
    ) {
      console.log(
        "Already granted permission for push notifications but there is no token on firebase..."
      );
      console.log(
        "So we will try to create a new token and update the firebase doc..."
      );
      const createdNotificationToken = await createExpoPushToken();
      if (!createdNotificationToken) {
        console.error("Failed to create a new token.");
        return false;
      }

      const updateFirebaseResult = await updateNotificationTokenOnFirebase(
        createdNotificationToken
      );
      if (!updateFirebaseResult) {
        console.error("Failed to update notification token on firebase.");
        return false;
      }

      return true;
    }

    if (
      !currentNotificationStatus.granted &&
      currentNotificationStatus.canAskAgain
    ) {
      console.log(
        "Permission for push notifications has not been granted yet."
      );
      console.log("We will try to get the permission now...");

      try {
        const newNotificationStatus =
          await Notifications.requestPermissionsAsync();
        if (!newNotificationStatus.granted) {
          console.log("Failed to grant permission for push notifications.");
          return false;
        }

        const createdNotificationToken = await createExpoPushToken();
        if (!createdNotificationToken) {
          console.error("Failed to create a new token.");
          return false;
        }

        const updateFirebaseResult = await updateNotificationTokenOnFirebase(
          createdNotificationToken
        );
        if (!updateFirebaseResult) {
          console.error("Failed to update notification token on firebase.");
          return false;
        }

        return true;
      } catch (error) {
        console.error(
          "Error while requesting notification permissions: ",
          error
        );
        return false;
      }
    }

    if (
      !currentNotificationStatus.granted &&
      !currentNotificationStatus.canAskAgain
    ) {
      console.log(
        "Permission for push notifications has not been granted and cannot be asked again."
      );
      try {
        await Linking.openSettings();
        return true;
      } catch (error) {
        console.error("Failed to open settings: ", error);
        return false;
      }
    }

    if (
      currentNotificationStatus.granted &&
      !currentNotificationStatus.canAskAgain
    ) {
      console.log(
        "Permission for push notifications has been granted but cannot be asked again."
      );
      try {
        await Linking.openSettings();
        return true;
      } catch (error) {
        console.error("Failed to open settings: ", error);
        return false;
      }
    }

    console.error("Unexpected error occurred.");
    return false;
  };

  if (!notificationSettingsData) {
    return (
      <View
        style={{
          width: "100%",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color="white" />
      </View>
    );
  }

  const notificationStatus: "set" | "not-set" =
    notificationSettingsData.notificationToken.length > 0 ? "set" : "not-set";

  return (
    <View
      style={{
        width: "100%",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {notificationStatus === "set" && (
        <View
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            gap: 20,
          }}
        >
          <FontAwesome name="bell-o" size={64} color="white" />
          <Text style={{ textAlign: "center" }}>
            Notifications are already set.
          </Text>
        </View>
      )}
      {notificationStatus === "not-set" && (
        <View
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            gap: 20,
          }}
        >
          <FontAwesome5 name="bell-slash" size={64} color="red" />
          <Text style={{ textAlign: "center" }}>
            Looks like your notifications are not set properly.
          </Text>
          <Pressable
            onPress={handleSetNotificationsButton}
            style={{
              backgroundColor: "white",
              padding: 10,
              borderRadius: 10,
            }}
          >
            <Text fontSize={12} style={{ color: "black" }}>
              Click here to set notifications
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default notificationSettings;
