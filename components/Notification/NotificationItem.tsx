import { Text } from "@/components/Text/Text";
import { firestore } from "@/firebase/client";
import { NotificationData } from "@/types/Notification";
import { UserInServer } from "@/types/User";
import { Entypo, Feather } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { Image } from "expo-image";
import { router, usePathname } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

type Props = {
  notificationData: NotificationData;
  lastOpenedTime: number;
};

const NotificationItem = ({ notificationData, lastOpenedTime }: Props) => {
  const [senderData, setSenderData] = useState<UserInServer | null>(null);

  const [lastOpenedTimeLocal, setLastOpenedTimeLocal] =
    useState(lastOpenedTime);

  const pathname = usePathname();

  useEffect(() => {
    if (notificationData.source) handleGetSenderData();
  }, [notificationData.source]);

  useEffect(() => {
    if (pathname !== "/home/notifications") {
      setLastOpenedTimeLocal(lastOpenedTime);
    }
  }, [lastOpenedTime, pathname]);

  const handleGetSenderData = async () => {
    try {
      const userDocRef = doc(firestore, `/users/${notificationData.source}`);

      const userDocSnapshot = await getDoc(userDocRef);

      if (!userDocSnapshot.exists()) {
        console.error(
          "User's data can not be fecthed: ",
          notificationData.source
        );
        return setSenderData(null);
      }

      const userDocData = userDocSnapshot.data() as UserInServer;

      return setSenderData(userDocData);
    } catch (error) {
      console.error("Error on getting user's data: ", error);
      return setSenderData(null);
    }
  };

  const handleClickSenderInformation = () => {
    router.push(`/home/profile/${notificationData.source}`);
  };

  const handleClickPreviewButton = () => {
    if (notificationData.type === "comment") {
      const postDocPath = notificationData.params.commentedPostDocPath;
      if (!postDocPath) return;

      const elements = postDocPath.split("/");

      const postSender = elements[2];
      const postId = elements[4];

      return router.push(`/home/post?sender=${postSender}&id=${postId}`);
    }

    if (notificationData.type === "frenletCreate") {
      const frenletDocPath = notificationData.params.createdFrenletDocPath;
      if (!frenletDocPath) return;
      const elements = frenletDocPath.split("/");

      const receiver = elements[2];
      const id = elements[6];

      router.push(`/home/frenlet?receiver=${receiver}&id=${id}`);
      return;
    }
    if (notificationData.type === "frenletReply") {
      const frenletDocPath = notificationData.params.repliedFrenletDocPath;
      if (!frenletDocPath) return;
      const elements = frenletDocPath.split("/");

      const receiver = elements[2];
      const id = elements[6];

      router.push(`/home/frenlet?receiver=${receiver}&id=${id}`);
      return;
    }
    if (notificationData.type === "ratePost") {
      const postDocPath = notificationData.params.ratedPostDocPath;
      if (!postDocPath) return;
      const elements = postDocPath.split("/");

      const postSender = elements[2];
      const postId = elements[4];

      router.push(`/home/post?sender=${postSender}&id=${postId}`);
      return;
    }
  };

  if (!senderData)
    return (
      <View
        style={{
          height: 70,
          width: "100%",
          backgroundColor: "rgb(27,27,27)",
          borderRadius: 10,
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color="white" />
      </View>
    );

  const message =
    notificationData.type === "comment"
      ? `commented to your post: "${notificationData.params.comment}"`
      : notificationData.type === "follow"
      ? "started to follow you"
      : notificationData.type === "frenletCreate"
      ? `created frenlet on you: "${notificationData.params.message}"`
      : notificationData.type === "frenletReply"
      ? `replied your frenlet: "${notificationData.params.message}"`
      : notificationData.type === "ratePost"
      ? `rated your post with ${notificationData.params.rate} stars`
      : "made unknown action";

  return (
    <View
      style={{
        width: "100%",
        backgroundColor: "rgb(27,27,27)",
        borderRadius: 10,
        padding: 10,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: "90%",
          flexDirection: "row",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Pressable onPress={handleClickSenderInformation}>
          <Image
            source={
              senderData.profilePhoto ||
              require("@/assets/images/user.jpg")
            }
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
            }}
            transition={500}
            placeholder={{ blurhash: "" }}
          />
        </Pressable>

        <View
          style={{
            maxWidth: "100%",
            display: "flex",
            flexDirection: "row",
            gap: 5,
            flexWrap: "wrap",
          }}
        >
          <Text bold>{senderData.fullname}</Text>
          <Text>{message}</Text>
        </View>

        <Text
          style={{
            fontSize: 12,
            color: "gray",
          }}
        >
          {formatDistanceToNow(new Date(notificationData.timestamp))}
        </Text>
      </View>

      <Pressable
        onPress={handleClickPreviewButton}
        style={{
          flexDirection: "row",
          width: "10%",
          justifyContent: "center",
        }}
      >
        {(notificationData.type === "ratePost" ||
          notificationData.type === "comment" ||
          notificationData.type === "frenletCreate" ||
          notificationData.type === "frenletReply") && (
          <Feather name="image" size={24} color="white" />
        )}

        {lastOpenedTimeLocal < notificationData.timestamp && (
          <Entypo name="dot-single" size={24} color="red" />
        )}
      </Pressable>
    </View>
  );
};

export default NotificationItem;
