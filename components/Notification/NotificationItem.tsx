import { Text } from "@/components/Text/Text";
import { NotificationData } from "@/types/Notification";
import { UserInServer } from "@/types/User";
import { Entypo, Feather } from "@expo/vector-icons";
import crashlytics from "@react-native-firebase/crashlytics";
import firestore from "@react-native-firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { Image } from "expo-image";
import { router, usePathname } from "expo-router";
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
      const userDocSnapshot = await firestore()
        .doc(`users/${notificationData.source}`)
        .get();

      if (!userDocSnapshot.exists) {
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

  const createRouteForPost = (postDocPath?: string) => {
    if (!postDocPath) {
      crashlytics().recordError(
        new Error("Post doc path is not provided for notification item.")
      );
      console.error("Post doc path is not provided for notification item.");
      return false;
    }

    const elements = postDocPath.split("/");

    const usersIndex = elements.findIndex((element) => element === "users");

    if (usersIndex === -1) {
      crashlytics().recordError(
        new Error("Users index not found on notification item post doc path.")
      );
      console.error(
        "Users index not found on notification item post doc path."
      );
      return false;
    }

    const postSenderIndex = usersIndex + 1;
    const postIdIndex = usersIndex + 3;

    const postSender = elements[postSenderIndex];
    const postId = elements[postIdIndex];

    if (!postSender || !postId) {
      crashlytics().recordError(
        new Error(
          "Post sender or post id not found on notification item post doc path."
        )
      );
      console.error(
        "Post sender or post id not found on notification item post doc path."
      );
      return false;
    }

    return `/home/notifications/post?sender=${postSender}&id=${postId}`;
  };

  const handleClickSenderInformation = () => {
    const subScreens = pathname.split("/");

    subScreens.push(`profile/${notificationData.source}`);

    const finalDestination = subScreens.join("/");

    router.push(finalDestination);
  };

  const handleClickPreviewButton = () => {
    if (notificationData.type === "comment") {
      const postDocPath = notificationData.params.commentedPostDocPath;

      const routerPath = createRouteForPost(postDocPath);
      if (!routerPath) return;

      return router.push(routerPath);
    }

    if (notificationData.type === "ratePost") {
      const postDocPath = notificationData.params.ratedPostDocPath;

      const routerPath = createRouteForPost(postDocPath);
      if (!routerPath) return;

      return router.push(routerPath);
    }

    if (notificationData.type === "collectibleBought") {
      const postDocPath = notificationData.params.collectiblePostDocPath;

      const routerPath = createRouteForPost(postDocPath);
      if (!routerPath) return;

      return router.push(routerPath);
    }

    if (notificationData.type === "follow") {
      handleClickSenderInformation();
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
      ? "started to follow you."
      : notificationData.type === "ratePost"
      ? `rated your post with ${notificationData.params.rate} ⭐️.`
      : notificationData.type === "collectibleBought"
      ? `bought a collectible from you.`
      : "made unknown action";

  return (
    <Pressable
      onPress={handleClickPreviewButton}
      style={{
        width: "100%",
        backgroundColor: "rgb(27,27,27)",
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
      }}
    >
      <View
        style={{
          width: "90%",
          flexDirection: "row",
        }}
      >
        <Pressable
          style={{
            width: "20%",
          }}
          onPress={handleClickSenderInformation}
        >
          <Image
            source={
              senderData.profilePhoto || require("@/assets/images/user.jpg")
            }
            style={{
              width: "85%",
              aspectRatio: 1,
              borderRadius: 25,
            }}
            transition={500}
          />
        </Pressable>

        <View
          style={{
            width: "80%",
            flexDirection: "column",
            gap: 2,
            justifyContent: "center",
          }}
        >
          <Pressable onPress={handleClickSenderInformation}>
            <Text fontSize={12} bold>
              {senderData.fullname}
            </Text>
          </Pressable>

          <Text fontSize={12}>{message}</Text>
          <Text
            style={{
              fontSize: 10,
              color: "gray",
            }}
          >
            {formatDistanceToNow(new Date(notificationData.timestamp))}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          width: "10%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {(notificationData.type === "ratePost" ||
          notificationData.type === "comment" ||
          notificationData.type === "collectibleBought") && (
          <Feather name="image" size={24} color="white" />
        )}

        {lastOpenedTimeLocal < notificationData.timestamp && (
          <Entypo name="dot-single" size={24} color="red" />
        )}
      </View>
    </Pressable>
  );
};

export default NotificationItem;
