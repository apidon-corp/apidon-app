import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

import Constants from "expo-constants";
import auth from "@react-native-firebase/auth";
import apiRoutes from "@/helpers/ApiRoutes";

async function registerForPushNotifications() {
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
  if (currentNotificationStatus.granted) {
    console.log("Already granted permission for push notifications.");
    return false;
  }

  const newNotificationStatus = await Notifications.requestPermissionsAsync();
  if (!newNotificationStatus.granted) {
    console.log("Failed to grant permission for push notifications.");
    return false;
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  if (!projectId) {
    console.log("Failed to get project id.");
    return false;
  }

  try {
    const tokenGetResult = await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    });

    const token = tokenGetResult.data;
    return token;
  } catch (error) {
    console.error("Error while getting push token: ", error);
    return false;
  }
}

async function updateNotificationTokenOnFirebase(token: string) {
  const currentUserAuthObject = auth().currentUser;
  if (!currentUserAuthObject) return false;

  try {
    const idToken = await currentUserAuthObject.getIdToken();
    const response = await fetch(
      apiRoutes.user.notification.updateNotificationToken,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          notificationToken: token,
        }),
      }
    );

    if (!response.ok) {
      const message = await response.text();
      console.error(
        "Response from updateNotificationToken API is not okay: ",
        message
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error while updating notification token: ", error);
    return false;
  }
}

export async function makeDeviceReadyToGetNotifications() {
  const notificationToken = await registerForPushNotifications();
  if (!notificationToken) return;

  await updateNotificationTokenOnFirebase(notificationToken);
}

export function adjustNotificationSettings(muted?: boolean) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: muted ? false : true,
      shouldSetBadge: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
    }),
  });
}

export function resetNotificationBadge() {
  Notifications.setBadgeCountAsync(0);
}
