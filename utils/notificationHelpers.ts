import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import apiRoutes from "@/helpers/ApiRoutes";
import auth from "@react-native-firebase/auth";
import Constants from "expo-constants";

import appCheck from "@react-native-firebase/app-check";

import crashlytics from "@react-native-firebase/crashlytics";

import { NotificationSettingsDocData } from "@/types/Notification";
import firestore from "@react-native-firebase/firestore";

async function getNotificationTokenFromDatabase() {
  const displayName = auth().currentUser?.displayName || "";
  if (!displayName) return false;

  try {
    const notificationSettingsSnapshot = await firestore()
      .doc(`users/${displayName}/notifications/notificationSettings`)
      .get();

    if (!notificationSettingsSnapshot.exists) {
      console.error("Notification settings doc does not exist.");
      return false;
    }

    const data =
      notificationSettingsSnapshot.data() as NotificationSettingsDocData;
    if (!data) {
      console.error("Notification settings doc data is null.");
      return false;
    }

    return data.notificationToken;
  } catch (error) {
    console.error("Error getting notification settings doc: ", error);
    return false;
  }
}

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

  if (!isRealDevice && Platform.OS === "ios") return false;

  try {
    const currentNotificationStatus = await Notifications.getPermissionsAsync();
    if (currentNotificationStatus.granted) {
      const notificationTokenOnServer =
        await getNotificationTokenFromDatabase();
      if (!notificationTokenOnServer) {
        // We have authorized notifications but we don't have token.
        // Probably, we sign out and then in on same device.
        // We need to create notification token...
        const createdNotificationToken = await createExpoPushToken();
        return createdNotificationToken;
      }

      // We authorized notifications and also have a valid notification token.
      // Don't need to make action.
      return false;
    }
  } catch (error) {
    console.error("Error while getting notification permissions: ", error);
    return false;
  }

  try {
    const newNotificationStatus = await Notifications.requestPermissionsAsync();
    if (!newNotificationStatus.granted) return false;
  } catch (error) {
    console.error("Error while requesting notification permissions: ", error);
    return false;
  }

  const createdNotificationToken = await createExpoPushToken();
  if (!createdNotificationToken) return false;

  return createdNotificationToken;
}

export async function createExpoPushToken() {
  const projectId = Constants.expoConfig?.extra?.eas.projectId || "";

  if (!projectId) {
    console.log("Failed to get project id.");
    crashlytics().recordError(
      new Error("Failed to get project id while getting push token.")
    );
    return false;
  }

  try {
    const tokenGetResult = await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    });

    const token = tokenGetResult.data;
    return token;
  } catch (error) {
    crashlytics().recordError(
      new Error(`Error while getting push token: ${error}`)
    );
    console.error("Error while getting push token: ", error);
    return false;
  }
}

export async function updateNotificationTokenOnFirebase(token: string) {
  const currentUserAuthObject = auth().currentUser;
  if (!currentUserAuthObject) return false;

  try {
    const idToken = await currentUserAuthObject.getIdToken();

    const { token: appchecktoken } = await appCheck().getLimitedUseToken();

    const response = await fetch(
      apiRoutes.user.notification.updateNotificationToken,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
          appchecktoken,
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
    crashlytics().recordError(
      new Error(`Error while updating notification token: ${error}`)
    );
    console.error("Error while updating notification token: ", error);
    return false;
  }
}

export async function makeDeviceReadyToGetNotifications() {
  const notificationToken = await registerForPushNotifications();
  if (!notificationToken) return false;

  return await updateNotificationTokenOnFirebase(notificationToken);
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
