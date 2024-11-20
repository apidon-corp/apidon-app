import { UserInServer } from "@/types/User";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, View } from "react-native";
import Text from "../Text/Text";

import auth from "@react-native-firebase/auth";
import appCheck from "@react-native-firebase/app-check";
import apiRoutes from "@/helpers/ApiRoutes";

import firestore from "@react-native-firebase/firestore";

type Props = {
  userData: UserInServer;
  modalRef: React.RefObject<BottomSheetModal>;
  isOwnPage: boolean;
};

const UserSettingsBottomSheetModalContent = ({
  userData,
  modalRef,
  isOwnPage,
}: Props) => {
  const [blockLoading, setBlockLoading] = useState(false);
  const [unBlockLoading, setUnBlockLoading] = useState(false);

  const [blocked, setBlocked] = useState<null | boolean>(null);

  useEffect(() => {
    if (isOwnPage) return setBlocked(false);

    const displayName = auth().currentUser?.displayName || "";
    if (!displayName) return;

    const unsubscribe = firestore()
      .doc(`users/${displayName}/blocks/${userData.username}`)
      .onSnapshot(
        (snapshot) => {
          setBlocked(snapshot.exists);
        },
        (error) => {
          console.error("Error on getting realtime data  ", error);
          setBlocked(null);
        }
      );

    return () => unsubscribe();
  }, []);

  const handleShareButton = async () => {
    try {
      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (!isSharingAvailable) return;

      const baseURL = process.env.EXPO_PUBLIC_APP_LINK_BASE_URL || "";
      if (!baseURL) return;

      const url = baseURL + "/" + userData.username;

      await Sharing.shareAsync(url, {
        dialogTitle: `Share ${userData.fullname} with your friends!`,
        mimeType: "text/plain",
        UTI: "public.plain-text",
      });

      modalRef.current?.dismiss();
    } catch (error) {
      console.error(error);
    }
  };

  const handleBlockButton = () => {
    if (blockLoading) return;

    Alert.alert(
      "Block User",
      `Are you sure you want to block @${userData.username}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Block",
          style: "destructive",
          onPress: () => {
            handleBlock();
          },
        },
      ]
    );
  };

  const handleBlock = async () => {
    if (blockLoading) return;

    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return;

    setBlockLoading(true);

    try {
      const idToken = await currentUserAuthObject.getIdToken();
      const { token: appchecktoken } = await appCheck().getLimitedUseToken();

      const response = await fetch(apiRoutes.user.social.block, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
          appchecktoken,
        },
        body: JSON.stringify({
          blockedUser: userData.username,
        }),
      });

      if (!response.ok) {
        console.error(
          "Response from block api is not okay: ",
          await response.text()
        );
        return setBlockLoading(false);
      }

      // Good to go.
      setBlockLoading(false);

      Alert.alert(
        "User Blocked",
        `${userData.username} has been blocked successfully. Your profile, posts, collectibles, ratings, and comments are now hidden from @${userData.username}.`,
        [
          {
            text: "OK",
            onPress: () => {
              modalRef.current?.dismiss();
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error on blocking user: ", error);
      return setBlockLoading(false);
    }
  };

  const handleCancelBlockButton = () => {
    if (unBlockLoading) return;

    Alert.alert(
      "Cancel Block",
      `Are you sure you want to cancel block of @${userData.username}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Cancel Block",
          style: "destructive",
          onPress: () => {
            handleCancelBLock();
          },
        },
      ]
    );
  };

  const handleCancelBLock = async () => {
    if (unBlockLoading) return;

    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return;

    setUnBlockLoading(true);

    try {
      const idToken = await currentUserAuthObject.getIdToken();
      const { token: appchecktoken } = await appCheck().getLimitedUseToken();

      const response = await fetch(apiRoutes.user.social.unBlock, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
          appchecktoken,
        },
        body: JSON.stringify({
          unBlockedUser: userData.username,
        }),
      });

      if (!response.ok) {
        console.error(
          "Response from unblock api is not okay: ",
          await response.text()
        );
        return setUnBlockLoading(false);
      }

      // Good to go.
      setUnBlockLoading(false);

      Alert.alert(
        "User Unblocked",
        `@${userData.username} has been unblocked successfully.\n Your profile, posts, collectibles, ratings, and comments are now visible to @${userData.username}.`,
        [
          {
            text: "OK",
            onPress: () => {
              modalRef.current?.dismiss();
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error on unblocking user: ", error);
      return setUnBlockLoading(false);
    }
  };

  if (blocked === null) {
    return (
      <View
        style={{
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
    <View style={{ flex: 1, gap: 10 }}>
      <Pressable
        onPress={handleShareButton}
        style={{
          padding: 10,
          borderRadius: 10,
          backgroundColor: "white",
          width: "100%",
          alignItems: "center",
        }}
      >
        <Text bold style={{ fontSize: 15, color: "black" }}>
          Share
        </Text>
      </Pressable>

      {!isOwnPage && (
        <>
          {blocked ? (
            <Pressable
              onPress={handleCancelBlockButton}
              style={{
                padding: 10,
                borderRadius: 10,
                backgroundColor: "black",
                width: "100%",
                alignItems: "center",
              }}
            >
              {unBlockLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text bold style={{ fontSize: 15 }}>
                  Cancel Block
                </Text>
              )}
            </Pressable>
          ) : (
            <Pressable
              onPress={handleBlockButton}
              style={{
                padding: 10,
                borderRadius: 10,
                backgroundColor: "black",
                width: "100%",
                alignItems: "center",
              }}
            >
              {blockLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text bold style={{ fontSize: 15 }}>
                  Block
                </Text>
              )}
            </Pressable>
          )}

          <Pressable
            style={{
              padding: 10,
              borderRadius: 10,
              backgroundColor: "red",
              width: "100%",
              alignItems: "center",
            }}
          >
            <Text bold style={{ fontSize: 15 }}>
              Report
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
};

export default UserSettingsBottomSheetModalContent;
