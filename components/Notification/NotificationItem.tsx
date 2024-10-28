import { Text } from "@/components/Text/Text";
import { ReceivedNotificationDocData } from "@/types/Notification";
import { PostServerData } from "@/types/Post";
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
  receivedNotificationDocData: ReceivedNotificationDocData;
  lastOpenedTime: number;
};

const NotificationItem = ({
  receivedNotificationDocData,
  lastOpenedTime,
}: Props) => {
  const [senderData, setSenderData] = useState<UserInServer | null>(null);

  const [lastOpenedTimeLocal, setLastOpenedTimeLocal] =
    useState(lastOpenedTime);

  const pathname = usePathname();

  const [postPreviewImage, setPostPreviewImage] = useState("");

  useEffect(() => {
    if (receivedNotificationDocData.source) handleGetSenderData();
  }, [receivedNotificationDocData.source]);

  useEffect(() => {
    if (pathname !== "/home/notifications") {
      setLastOpenedTimeLocal(lastOpenedTime);
    }
  }, [lastOpenedTime, pathname]);

  useEffect(() => {
    if (receivedNotificationDocData.type === "follow") return;

    let postDocPath = "";
    if (receivedNotificationDocData.type === "ratePost")
      postDocPath = receivedNotificationDocData.params.ratedPostDocPath;
    if (receivedNotificationDocData.type === "comment")
      postDocPath = receivedNotificationDocData.params.commentedPostDocPath;
    if (receivedNotificationDocData.type === "collectibleBought")
      postDocPath = receivedNotificationDocData.params.collectiblePostDocPath;

    if (!postDocPath) return;

    firestore()
      .doc(postDocPath)
      .get()
      .then((doc) => {
        if (!doc.exists) return setPostPreviewImage("");
        setPostPreviewImage((doc.data() as PostServerData).image);
      })
      .catch(() => {
        setPostPreviewImage("");
      });
  }, [receivedNotificationDocData]);

  const handleGetSenderData = async () => {
    try {
      const userDocSnapshot = await firestore()
        .doc(`users/${receivedNotificationDocData.source}`)
        .get();

      if (!userDocSnapshot.exists) {
        console.error(
          "User's data can not be fecthed: ",
          receivedNotificationDocData.source
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
    const route = `/home/notifications/profilePage?username=${receivedNotificationDocData.source}`;
    return router.push(route);
  };

  const handleClickPreviewButton = () => {
    if (receivedNotificationDocData.type === "comment") {
      const postDocPath =
        receivedNotificationDocData.params.commentedPostDocPath;

      const routerPath = createRouteForPost(postDocPath);
      if (!routerPath) return;

      return router.push(routerPath);
    }

    if (receivedNotificationDocData.type === "ratePost") {
      const postDocPath = receivedNotificationDocData.params.ratedPostDocPath;

      const routerPath = createRouteForPost(postDocPath);
      if (!routerPath) return;

      return router.push(routerPath);
    }

    if (receivedNotificationDocData.type === "collectibleBought") {
      const postDocPath =
        receivedNotificationDocData.params.collectiblePostDocPath;

      const routerPath = createRouteForPost(postDocPath);
      if (!routerPath) return;

      return router.push(routerPath);
    }

    if (receivedNotificationDocData.type === "follow") {
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
    receivedNotificationDocData.type === "comment"
      ? `commented to your post: "${receivedNotificationDocData.params.comment}"`
      : receivedNotificationDocData.type === "follow"
      ? "started to follow you."
      : receivedNotificationDocData.type === "ratePost"
      ? `rated your post with ${receivedNotificationDocData.params.rate} ⭐️.`
      : receivedNotificationDocData.type === "collectibleBought"
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
              borderRadius: 100,
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
            {formatDistanceToNow(
              new Date(receivedNotificationDocData.timestamp)
            )}
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
        {(receivedNotificationDocData.type === "ratePost" ||
          receivedNotificationDocData.type === "comment" ||
          receivedNotificationDocData.type === "collectibleBought") &&
          (postPreviewImage ? (
            <Image
              source={postPreviewImage}
              style={{
                width: 24,
                aspectRatio: 1,
                borderRadius: 5,
              }}
            />
          ) : (
            <Feather name="image" size={24} color="white" />
          ))}

        {lastOpenedTimeLocal < receivedNotificationDocData.timestamp && (
          <Entypo name="dot-single" size={24} color="red" />
        )}
      </View>
    </Pressable>
  );
};

export default NotificationItem;
