import {
  ActivityIndicator,
  Alert,
  AppState,
  AppStateStatus,
  Pressable,
  View,
} from "react-native";

import { Text } from "@/components/Text/Text";
import { NotificationSettingsDocData } from "@/types/Notification";
import React, { useEffect, useState } from "react";

import { useAuth } from "@/providers/AuthProvider";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import {
  createExpoPushToken,
  updateNotificationTokenOnFirebase,
} from "@/utils/notificationHelpers";

import * as Linking from "expo-linking";

const notificationSettings = () => {
  const { authStatus } = useAuth();

  const [notificationSettingsData, setNotificationSettingsData] =
    useState<null | NotificationSettingsDocData>(null);

  const [notificationStatus, setNotificationStatus] = useState<
    "loading" | "not-allowed" | "not-set" | "set"
  >("loading");

  const [loading, setLoading] = useState(false);

  const [appState, setAppState] = useState<AppStateStatus>("unknown");

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

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

  // Checking Initial Status
  useEffect(() => {
    checkInitialStatus();
  }, [notificationSettingsData, appState]);

  const checkInitialStatus = async () => {
    setNotificationStatus("loading");
    try {
      const currentNotificationStatus =
        await Notifications.getPermissionsAsync();

      const grantStatus = currentNotificationStatus.granted;

      if (!grantStatus) return setNotificationStatus("not-allowed");
      if (!notificationSettingsData) return setNotificationStatus("not-set");

      const tokenStatus = notificationSettingsData.notificationToken.length > 0;

      if (tokenStatus) return setNotificationStatus("set");
      if (!tokenStatus) return setNotificationStatus("not-set");
    } catch (error) {
      console.error("Error while getting notification permissions: ", error);
      return setNotificationStatus("not-set");
    }
  };

  const handleSetNotificationsButton = async () => {
    if (loading) return;

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

    if (!isRealDevice && Platform.OS === "ios") {
      console.log("Only real devices can subscribe to push notifications.");
      return false;
    }

    const currentNotificationStatus = await Notifications.getPermissionsAsync();

    if (currentNotificationStatus.canAskAgain) {
      setLoading(true);

      const newNotificationStatus =
        await Notifications.requestPermissionsAsync();

      if (!newNotificationStatus.granted) {
        console.log("Failed to grant permission for push notifications.");
        setLoading(false);
        return false;
      }
      const createdNotificationToken = await createExpoPushToken();
      if (!createdNotificationToken) {
        setLoading(false);
        return false;
      }

      const updateTokenOnFirebaseResult =
        await updateNotificationTokenOnFirebase(createdNotificationToken);
      if (!updateTokenOnFirebaseResult) {
        setLoading(false);
        return false;
      }

      setLoading(false);

      return true;
    }

    if (!currentNotificationStatus.canAskAgain) {
      Alert.alert(
        "Notification Permission Denied",
        "To receive notifications, please enable notification permissions in your device settings.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Settings",
            onPress: () =>
              Linking.openSettings().catch((err) =>
                console.error("Error opening settings: ", err)
              ),
          },
        ]
      );

      return true;
    }
  };

  if (notificationStatus === "loading") {
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
            Notifications are enabled.
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
            disabled={loading}
            onPress={handleSetNotificationsButton}
            style={{
              backgroundColor: "white",
              padding: 10,
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
              minWidth: 120,
            }}
          >
            {loading ? (
              <ActivityIndicator color="black" size={12} />
            ) : (
              <Text fontSize={12} style={{ color: "black" }}>
                Set Notifications
              </Text>
            )}
          </Pressable>
        </View>
      )}

      {notificationStatus === "not-allowed" && (
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
            Notifications are not allowed on this device.
          </Text>
          <Pressable
            disabled={loading}
            onPress={handleSetNotificationsButton}
            style={{
              backgroundColor: "white",
              padding: 10,
              borderRadius: 10,
            }}
          >
            {loading ? (
              <ActivityIndicator color="black" />
            ) : (
              <Text fontSize={12} style={{ color: "black" }}>
                Allow Notifications
              </Text>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default notificationSettings;
