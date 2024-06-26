import { Pressable, View } from "react-native";
import { Text } from "@/components/Text/Text";
import React, { useEffect, useState } from "react";
import { NotificationData } from "@/types/Notification";
import { UserInServer } from "@/types/User";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/firebase/client";
import { Image } from "expo-image";
import { formatDistanceToNow, set } from "date-fns";
import { Entypo, Feather } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";

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
    if (notificationData.sender) handleGetSenderData();
  }, [notificationData.sender]);

  useEffect(() => {
    if (pathname !== "/home/notifications") {
      setLastOpenedTimeLocal(lastOpenedTime);
    }
  }, [lastOpenedTime, pathname]);

  const handleGetSenderData = async () => {
    try {
      const userDocRef = doc(firestore, `/users/${notificationData.sender}`);

      const userDocSnapshot = await getDoc(userDocRef);

      if (!userDocSnapshot.exists()) {
        console.error(
          "User's data can not be fecthed: ",
          notificationData.sender
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
    router.push(`/home/profile/${notificationData.sender}`);
  };

  const handleClickPostPreviewButton = () => {
    const postDocPath = notificationData.postDocPath;
    if (!postDocPath) return;

    const elements = postDocPath.split("/");
    console.log(elements);

    const postSender = elements[2];
    const postId = elements[4];

    router.push(`/home/post?sender=${postSender}&id=${postId}`);
  };

  if (!senderData) return <></>;

  const message =
    notificationData.cause === "comment"
      ? `commented your post`
      : notificationData.cause === "follow"
      ? "started to follow you"
      : notificationData.cause === "frenlet"
      ? "created frenlet on you"
      : notificationData.cause === "like"
      ? "liked your post"
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
          flexDirection: "row",
          gap: 10,
          alignItems: "center",
          width: "90%",
          flexWrap: "wrap",
        }}
      >
        <Pressable onPress={handleClickSenderInformation}>
          <Image
            source={senderData.profilePhoto}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
            }}
            transition={500}
          />
        </Pressable>

        <View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 5,
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
            {formatDistanceToNow(new Date(notificationData.ts))}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={handleClickPostPreviewButton}
        style={{
          flexDirection: "row",
          width: "10%",
          justifyContent: "center",
        }}
      >
        {!(
          notificationData.cause === "follow" ||
          notificationData.cause === "frenlet"
        ) && <Feather name="image" size={24} color="white" />}

        {lastOpenedTimeLocal < notificationData.ts && (
          <Entypo name="dot-single" size={24} color="red" />
        )}
      </Pressable>
    </View>
  );
};

export default NotificationItem;
