import { apidonPink } from "@/constants/Colors";
import { AntDesign, Entypo, Feather, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Pressable, View } from "react-native";
import Text from "../Text/Text";

import { CollectedCollectibleDocData } from "@/types/Collectible";
import { ThemedButton } from "react-native-really-awesome-button";

import { PostServerData } from "@/types/Post";
import { UserInServer } from "@/types/User";
import firestore from "@react-native-firebase/firestore";
import { formatDistanceToNowStrict } from "date-fns";
import { router } from "expo-router";
import Animated, {
  Easing,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import RainbowAnimation from "./RainbowBackground";

const INNER_RADIUS = 20;

type Props = {
  collectedCollectibleDocData: CollectedCollectibleDocData;
};

const CollectibleItem = React.memo(({ collectedCollectibleDocData }: Props) => {
  const screenWidth = Dimensions.get("screen").width; // Padding 15 from parent.

  const [collectorProfileImage, setCollectorProfileImage] = useState<
    string | null
  >(null);

  const [creatorData, setCreatorData] = useState<UserInServer | null>(null);

  const [collectibleImage, setCollectibleImage] = useState<string | null>(null);

  const [collectibleImageLoaded, setCollectibleImageLoaded] = useState(false);

  const imagePlaceholderOpacityAnimatedValue = useSharedValue(1);

  useEffect(() => {
    if (!collectedCollectibleDocData) return setCollectorProfileImage(null);

    getCollectorProfileImage(collectedCollectibleDocData);
    getCreatorData(collectedCollectibleDocData.creatorUsername);
    getCollectibleImage(collectedCollectibleDocData.postDocPath);
  }, [collectedCollectibleDocData]);

  useEffect(() => {
    if (collectibleImageLoaded)
      imagePlaceholderOpacityAnimatedValue.value = withTiming(0, {
        duration: 500 * 1,
        easing: Easing.linear,
      });
  }, [collectibleImageLoaded]);

  const getCollectibleImage = async (postDocPath: string) => {
    try {
      const doc = await firestore().doc(postDocPath).get();
      if (!doc.exists) {
        console.error("Post document not found: ", postDocPath);
        return setCollectibleImage(null);
      }

      const data = doc.data() as PostServerData;
      if (!data) {
        console.error("Post document data not found: ", postDocPath);
        return setCollectibleImage(null);
      }

      setCollectibleImage(data.image);
    } catch (error) {
      console.error("Error on getting post image: ", error);
      setCollectibleImage(null);
    }
  };

  const getCollectorProfileImage = async (
    collectedCollectibleDocData: CollectedCollectibleDocData
  ) => {
    try {
      const doc = await firestore()
        .doc(`users/${collectedCollectibleDocData.collectorUsername}`)
        .get();
      if (!doc.exists) {
        console.error(
          "Collector document not found: ",
          collectedCollectibleDocData.collectorUsername
        );
        return setCollectorProfileImage(null);
      }

      const data = doc.data() as UserInServer;
      if (!data) {
        console.error(
          "Collector document data not found: ",
          collectedCollectibleDocData.collectorUsername
        );
        return setCollectorProfileImage(null);
      }

      setCollectorProfileImage(data.profilePhoto);
    } catch (error) {
      console.error("Error on getting collector profile image: ", error);
      setCollectorProfileImage(null);
    }
  };

  const getCreatorData = async (creatorUsername: string) => {
    try {
      const doc = await firestore().doc(`users/${creatorUsername}`).get();
      if (!doc.exists) {
        console.error("Creator document not found: ", creatorUsername);
        return setCreatorData(null);
      }

      const data = doc.data() as UserInServer;
      if (!data) {
        console.error("Creator document data not found: ", creatorUsername);
        return setCreatorData(null);
      }

      setCreatorData(data);
    } catch (error) {
      console.error("Error on getting creator data: ", error);
      setCreatorData(null);
    }
  };

  const goToPost = () => {
    if (!collectedCollectibleDocData) return;

    const id = collectedCollectibleDocData.postDocPath.split("/").pop();

    // Navigation
    return router.push(`/home/feed/post?id=${id}`);
  };

  const goToUser = (username: string) => {
    // Navigation
    return router.push(`/home/feed/profilePage?username=${username}`);
  };

  if (
    !collectibleImage ||
    !collectedCollectibleDocData ||
    !creatorData ||
    collectorProfileImage === null
  )
    return (
      <View
        style={{
          width: "100%",
          aspectRatio: 1,
          backgroundColor: "rgba(255,255,255,0.1)",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 20,
        }}
      >
        <ActivityIndicator size="small" color="white" />
      </View>
    );

  return (
    <Pressable
      id="root"
      style={{
        display: "flex",
        width: "100%",
        aspectRatio: 1,
        position: "relative",
      }}
      onPress={goToPost}
    >
      <RainbowAnimation
        thickness={2}
        rainbowOpacity={0.3}
        style={{
          position: "absolute",
          width: "100%",
          aspectRatio: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
        rotateSpeed={2}
        rainbowBorderRadius={20}
      >
        <Image
          cachePolicy="none"
          id="collectible-image"
          source={collectibleImage}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: INNER_RADIUS,
          }}
          onLoad={() => setCollectibleImageLoaded(true)}
        />

        <Animated.View
          id="image-placeholder"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "rgb(25, 25, 25)",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: INNER_RADIUS,
            opacity: imagePlaceholderOpacityAnimatedValue,
          }}
        >
          {!collectibleImageLoaded && (
            <Feather name="image" size={48} color="gray" />
          )}
        </Animated.View>
      </RainbowAnimation>

      {/**
       * Rank Part
       */}
      <>
        <View
          id="bottom-right-empty-block"
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            bottom: 0,
            right: 0,
            borderRightWidth: screenWidth * 0.1875,
            borderTopWidth: screenWidth * 0.1875,
            borderRightColor: "transparent",
            transform: [{ rotate: "180deg" }],
            borderTopLeftRadius: INNER_RADIUS,
          }}
        />

        <View
          id="rank-root"
          style={{
            position: "absolute",

            height: screenWidth * 0.125, // 50 for 400
            aspectRatio: 1,

            bottom: screenWidth * 0.03125, // 12.5 for 400
            right: screenWidth * 0.03125, // 12.5 for 400
          }}
        >
          <View
            style={{
              width: "90%",
              aspectRatio: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "black",
              borderRadius: 100,
            }}
          >
            <Text bold fontSize={16}>
              #{collectedCollectibleDocData.rank}
            </Text>
          </View>
        </View>
      </>

      {/**
       * Collector Part
       */}
      <>
        <View
          id="top-right-empty-block"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: screenWidth * 0.375, // 150 for 400
            height: screenWidth * 0.15, // 60 for 400
            backgroundColor: "black",
            zIndex: 0,
          }}
        />

        <View
          id="top-right-empyt-triangle-part"
          style={{
            position: "absolute",
            top: 0,
            right: screenWidth * 0.375, // 150 for 400

            borderRightWidth: screenWidth * 0.15,
            borderTopWidth: screenWidth * 0.15,

            borderRightColor: "transparent",

            transform: [{ rotate: "90deg" }],
          }}
        />

        <Pressable
          onPress={() =>
            goToUser(collectedCollectibleDocData.collectorUsername)
          }
          id="collector-data"
          style={{
            zIndex: 1,
            position: "absolute",
            top: 10,
            right: 10,
            width: screenWidth * 0.375, // 150 for 400
            borderColor: "red",
            alignItems: "flex-end",
          }}
        >
          <View style={{ width: "100%" }}>
            <View
              style={{
                width: "100%",
                flexDirection: "row-reverse",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Text
                bold
                fontSize={11}
                style={{ color: "gray", textDecorationLine: "underline" }}
              >
                Collected by
              </Text>
              <Entypo name="dot-single" size={11} color="gray" />
              <Text fontSize={9} style={{ color: "gray" }}>
                {formatDistanceToNowStrict(
                  new Date(collectedCollectibleDocData.timestamp)
                )}
              </Text>
            </View>

            <Text
              bold
              fontSize={12}
              style={{ color: "white", textAlign: "right" }}
            >
              @{collectedCollectibleDocData.collectorUsername}
            </Text>
          </View>

          <View
            style={{
              width: screenWidth * 0.225, // 90 for 400
              aspectRatio: 1,
              backgroundColor: "black",
              padding: 10,
              justifyContent: "center",
              borderRadius: 50,
            }}
          >
            {collectorProfileImage === "" && (
              <View
                id="pp-placeholder"
                style={{
                  width: "100%",
                  aspectRatio: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <AntDesign name="user" size={48} color="white" />
              </View>
            )}

            {collectorProfileImage && (
              <Image
                source={collectorProfileImage}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 50,
                }}
              />
            )}
          </View>
        </Pressable>
      </>

      <View
        id="sub-root"
        style={{
          width: "100%",
          height: "100%",
          padding: 10,
          justifyContent: "space-between",
          display: "flex",
        }}
      >
        <View
          style={{
            overflow: "hidden",
            width: screenWidth * 0.125,
            zIndex: 1,
          }}
        >
          <ThemedButton
            onPress={() => goToPost()}
            name="rick"
            backgroundColor="black"
            backgroundDarker="rgb(40, 40, 40)"
            width={screenWidth * 0.1125} // 45 for 400
            height={screenWidth * 0.1125} // 45 for 400
            paddingBottom={0}
            paddingTop={0}
            paddingHorizontal={0}
          >
            <AntDesign name="star" size={17} color="gray" />
          </ThemedButton>
        </View>

        <View id="to-create-gap" />

        <View
          id="bottom-part"
          style={{
            width: "100%",
            height: screenWidth * 0.1125, // 45 for 400
            borderRadius: 20,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Pressable
            onPress={() => goToUser(creatorData.username)}
            id="creator-part"
            style={{
              backgroundColor: "black",
              flexDirection: "row",
              gap: 5,
              borderRadius: 20,
              padding: 5,
              paddingRight: 10,
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1,
            }}
          >
            {creatorData.profilePhoto === "" && (
              <View
                style={{
                  height: "100%",
                  aspectRatio: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <AntDesign name="user" size={24} color="white" />
              </View>
            )}

            {creatorData.profilePhoto && (
              <Image
                id="creator-image"
                source={creatorData.profilePhoto}
                style={{ height: "100%", aspectRatio: 1, borderRadius: 50 }}
              />
            )}

            <View
              id="name-part"
              style={{
                justifyContent: "center",
              }}
            >
              <Text bold fontSize={11}>
                {creatorData.fullname}
              </Text>
              <View
                id="fullname-verified"
                style={{
                  flexDirection: "row",
                  gap: 3,
                  alignItems: "center",
                }}
              >
                <Text fontSize={11} bold>
                  @{creatorData.username}
                </Text>

                {creatorData.verified && (
                  <MaterialIcons name="verified" size={13} color={apidonPink} />
                )}
              </View>
            </View>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
});

export default CollectibleItem;
