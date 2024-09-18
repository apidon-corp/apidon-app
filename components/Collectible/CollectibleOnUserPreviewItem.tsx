import { apidonPink } from "@/constants/Colors";
import { useAuth } from "@/providers/AuthProvider";
import { CollectibleDocData } from "@/types/Collectible";
import { PostServerData } from "@/types/Post";
import { UserInServer } from "@/types/User";
import { FontAwesome, Foundation, MaterialIcons } from "@expo/vector-icons";
import firestore from "@react-native-firebase/firestore";
import { Image } from "expo-image";
import { router, usePathname } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import Text from "../Text/Text";

type Props = {
  postDocPath: string;
  collectibleDocPath: string;
};

const CollectibleOnUserPreviewItem = ({
  postDocPath,
  collectibleDocPath,
}: Props) => {
  const pathname = usePathname();

  const [postDocData, setPostDocData] = useState<PostServerData | null>(null);
  const [postSenderData, setPostSenderData] = useState<UserInServer | null>(
    null
  );

  const [collectibleDocData, setCollectibleDocData] =
    useState<CollectibleDocData | null>(null);

  const { authStatus } = useAuth();

  // Dynamic Data Fetching / Post Object
  useEffect(() => {
    if (authStatus !== "authenticated") return;

    const unsubscribe = firestore()
      .doc(postDocPath)
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) {
            return console.log("Post's realtime data can not be fecthed.");
          }
          const postDocData = snapshot.data() as PostServerData;
          setPostDocData(postDocData);

          if (!postSenderData)
            handleGetPostSenderInformation(postDocData.senderUsername);

          return;
        },
        (error) => {
          return console.error("Error on getting realtime data: ", error);
        }
      );

    return () => unsubscribe();
  }, [postDocPath, authStatus]);

  // Dynamic Data Fetching / Nft Object
  useEffect(() => {
    if (authStatus !== "authenticated") return;

    const unsubscribe = firestore()
      .doc(collectibleDocPath)
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) {
            setCollectibleDocData(null);
            return console.log(
              "Collectible's realtime data can not be fecthed."
            );
          }
          const collectibleDocDataFetched =
            snapshot.data() as CollectibleDocData;
          setCollectibleDocData(collectibleDocDataFetched);

          return;
        },
        (error) => {
          setCollectibleDocData(null);
          return console.error(
            "Error on getting realtime data of collectible: ",
            error
          );
        }
      );

    return () => unsubscribe();
  }, [collectibleDocPath, authStatus]);

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

    const destination = `post?sender=${postDocData.senderUsername}&id=${postDocData.id}`;

    const subScreens = pathname.split("/");

    if (subScreens[2] === "feed") {
      const route = `/home/feed/${destination}`;
      return router.navigate(route);
    }

    subScreens[subScreens.length - 1] = destination;
    const route = subScreens.join("/");
    return router.push(route);
  };

  if (!postDocData || !postSenderData || !collectibleDocData) {
    return (
      <View
        style={{
          padding: 15,
        }}
      >
        <View
          style={{
            width: "100%",
            aspectRatio: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: 25,
          }}
        >
          <ActivityIndicator color="white" />
        </View>
      </View>
    );
  }

  return (
    <Pressable
      onPress={handlePressPreview}
      style={{
        position: "relative",
        flex: 1,
        padding: 15,
      }}
    >
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

      <View
        id="price-tag"
        style={{
          position: "absolute",
          top: 25,
          right: 25,
          flexDirection: "row",
          backgroundColor: "black",
          borderRadius: 20,
          alignItems: "center",
          gap: 3,
          padding: 5,
          paddingHorizontal: 10,
        }}
      >
        <Foundation name="dollar" size={19} color="white" />
        <Text
          style={{
            fontSize: 14,
          }}
          bold
        >
          {collectibleDocData.price.price}
        </Text>
      </View>

      <View
        id="creator-data"
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          padding: 5,
          paddingRight: 15,
          backgroundColor: "black",
          borderRadius: 20,
          alignItems: "center",
          flexDirection: "row",
          gap: 5,
        }}
      >
        <Image
          source={
            postSenderData.profilePhoto || require("@/assets/images/user.jpg")
          }
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
          }}
          transition={500}
        />
        <View id="username-fullname">
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

      <View
        style={{
          position: "absolute",
          bottom: 25,
          right: 25,
          flexDirection: "row",
          backgroundColor: "black",
          borderRadius: 20,
          alignItems: "center",
          gap: 5,
          padding: 5,
          paddingHorizontal: 10,
        }}
      >
        <FontAwesome name="cubes" size={19} color="white" />
        <Text bold>
          {collectibleDocData.stock.remainingStock}/
          {collectibleDocData.stock.initialStock}
        </Text>
      </View>
    </Pressable>
  );
};

export default CollectibleOnUserPreviewItem;
