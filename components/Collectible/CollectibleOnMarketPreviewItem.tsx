import { apidonPink } from "@/constants/Colors";
import { CollectibleDocData } from "@/types/Collectible";
import { PostServerData } from "@/types/Post";
import { UserInServer } from "@/types/User";
import { FontAwesome, Foundation, MaterialIcons } from "@expo/vector-icons";
import firestore from "@react-native-firebase/firestore";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Pressable, View } from "react-native";
import Text from "../Text/Text";

import auth from "@react-native-firebase/auth";

type Props = {
  postDocPath: string;
  collectibleDocData: CollectibleDocData;
  isGrid: boolean;
};

const CollectibleOnMarketPreviewItem = ({
  postDocPath,
  collectibleDocData,
  isGrid,
}: Props) => {
  const [postDocData, setPostDocData] = useState<PostServerData | null>(null);
  const [postSenderData, setPostSenderData] = useState<UserInServer | null>(
    null
  );

  const animatedWidth = useRef(new Animated.Value(48)).current;

  const [currentUserBlockedBySender, setCurrentUserBlockedBySender] = useState<
    null | boolean
  >(null);

  // Getting post data
  useEffect(() => {
    handleGetPostData();
  }, [postDocPath]);

  // Changing width based oriantation.
  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: isGrid ? 48 : 100,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isGrid]);

  // Realtime Block Checking
  useEffect(() => {
    if (!postDocData) return;

    const displayName = auth().currentUser?.displayName || "";
    if (!displayName) return;

    if (postDocData.senderUsername === displayName)
      return setCurrentUserBlockedBySender(false);

    const unsubscribe = firestore()
      .doc(`users/${postDocData.senderUsername}/blocks/${displayName}`)
      .onSnapshot(
        (snapshot) => {
          setCurrentUserBlockedBySender(snapshot.exists);
        },
        (error) => {
          console.error("Error on getting realtime data  ", error);
          setCurrentUserBlockedBySender(null);
        }
      );

    return () => unsubscribe();
  }, [postDocData]);

  const handleGetPostData = async () => {
    if (!postDocPath) return setPostDocData(null);

    try {
      const postDoc = await firestore().doc(postDocPath).get();

      if (!postDoc.exists) {
        console.error("Post not found");
        return setPostDocData(null);
      }

      const postData = postDoc.data() as PostServerData;
      setPostDocData(postData);

      handleGetPostSenderInformation(postData.senderUsername);
    } catch (error) {
      console.error("Error on getting post data: ", error);
      return setPostDocData(null);
    }
  };

  const handleGetPostSenderInformation = async (senderUsername: string) => {
    try {
      const userDocSnapshot = await firestore()
        .doc(`users/${senderUsername}`)
        .get();
      if (!userDocSnapshot.exists) return setPostSenderData(null);

      const userDocData = userDocSnapshot.data() as UserInServer;

      return setPostSenderData(userDocData);
    } catch (error) {
      console.error("Error on getting initial data: ", error);
      return setPostSenderData(null);
    }
  };

  const handlePressPreview = () => {
    if (!postDocData || !postSenderData) return;
    return router.push(
      `/home/collectibles/post?sender=${postDocData.senderUsername}&id=${postDocData.id}`
    );
  };

  if (!postDocData || currentUserBlockedBySender === null || !postSenderData) {
    return (
      <View style={{ width: "48%", marginVertical: 8 }}>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.1)",
            aspectRatio: 1,
            borderRadius: 25,
          }}
        >
          <ActivityIndicator color="white" />
        </View>
      </View>
    );
  }

  if (
    !collectibleDocData ||
    currentUserBlockedBySender ||
    postSenderData.isScheduledToDelete
  ) {
    return false;
  }

  return (
    <Animated.View
      style={{
        marginVertical: 8,
        width: animatedWidth.interpolate({
          inputRange: [48, 100],
          outputRange: ["48%", "100%"],
        }),
      }}
    >
      <Pressable onPress={handlePressPreview} style={{ position: "relative" }}>
        <View>
          <Image
            source={postDocData.image}
            style={{
              width: "100%",
              aspectRatio: 1,
              borderRadius: 25,
            }}
          />
        </View>
        {collectibleDocData.type === "trade" && (
          <View
            id="price-tag"
            style={{
              position: "absolute",
              top: isGrid ? 5 : 10,
              right: isGrid ? 5 : 10,
              flexDirection: "row",
              backgroundColor: "black",
              borderRadius: 20,
              alignItems: "center",
              gap: 3,
              padding: 5,
              paddingHorizontal: 10,
            }}
          >
            <Foundation name="dollar" size={isGrid ? 16 : 19} color="white" />
            <Text
              style={{
                fontSize: isGrid ? 12 : 14,
              }}
              bold
            >
              {collectibleDocData.price.price}
            </Text>
          </View>
        )}

        {collectibleDocData.type === "event" && (
          <View
            id="event-tag"
            style={{
              position: "absolute",
              top: isGrid ? 5 : 10,
              right: isGrid ? 5 : 10,
              flexDirection: "row",
              backgroundColor: "black",
              borderRadius: 20,
              alignItems: "center",
              gap: 3,
              padding: 5,
              paddingHorizontal: 10,
            }}
          >
            <Text
              style={{
                fontSize: isGrid ? 12 : 14,
              }}
              bold
            >
              Event
            </Text>
          </View>
        )}

        <View
          style={{
            position: "absolute",
            bottom: isGrid ? 5 : 10,
            right: isGrid ? 5 : 10,
            flexDirection: "row",
            backgroundColor: "black",
            borderRadius: 20,
            alignItems: "center",
            gap: 5,
            padding: 5,
            paddingHorizontal: 10,
          }}
        >
          <FontAwesome name="cubes" size={isGrid ? 12 : 19} color="white" />
          <Text bold fontSize={isGrid ? 10 : 14}>
            {collectibleDocData.stock.remainingStock}/
            {collectibleDocData.stock.initialStock}
          </Text>
        </View>

        {postSenderData && (
          <View
            id="creator-data"
            style={{
              position: "absolute",
              bottom: isGrid ? 5 : 10,
              left: isGrid ? 5 : 10,
              padding: isGrid ? 0 : 5,
              paddingRight: isGrid ? 0 : 15,
              backgroundColor: "black",
              borderRadius: 20,
              alignItems: "center",
              flexDirection: "row",
              gap: 5,
            }}
          >
            <Image
              source={
                postSenderData.profilePhoto ||
                require("@/assets/images/user.jpg")
              }
              style={{
                width: isGrid ? 30 : 40,
                height: isGrid ? 30 : 40,
                borderRadius: 20,
              }}
              transition={500}
            />
            <View
              id="username-fullname"
              style={{
                display: isGrid ? "none" : undefined,
              }}
            >
              <View
                id="fullanme-verified"
                style={{
                  alignItems: "center",
                  gap: 3,
                  flexDirection: "row",
                }}
              >
                <Text fontSize={12}>{postSenderData.fullname}</Text>
                {postSenderData.verified && (
                  <MaterialIcons name="verified" size={14} color={apidonPink} />
                )}
              </View>
              <Text fontSize={10}>@{postDocData.senderUsername}</Text>
            </View>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

export default CollectibleOnMarketPreviewItem;
