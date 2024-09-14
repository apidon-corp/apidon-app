import { apidonPink } from "@/constants/Colors";
import { useAuth } from "@/providers/AuthProvider";
import { CollectibleDocData } from "@/types/Collectible";
import { PostServerData } from "@/types/Post";
import { UserInServer } from "@/types/User";
import { FontAwesome, Foundation, MaterialIcons } from "@expo/vector-icons";
import firestore from "@react-native-firebase/firestore";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import Text from "../Text/Text";

type Props = {
  postDocPath: string;
  collectibleDocData: CollectibleDocData;
};

const NftMarketPreviewItem = ({ postDocPath, collectibleDocData }: Props) => {
  const [postDocData, setPostDocData] = useState<PostServerData | null>(null);
  const [postSenderData, setPostSenderData] = useState<UserInServer | null>(
    null
  );

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

  if (!postDocData || !postSenderData) {
    return (
      <View style={{ flex: 1, backgroundColor: "black", padding: 15 }}>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.1)",
            height: 200,
          }}
        >
          <ActivityIndicator color={apidonPink} />
        </View>
      </View>
    );
  }

  if (!collectibleDocData) {
    return null;
  }

  return (
    <Pressable
      onPress={handlePressPreview}
      style={{ position: "relative", flex: 1, padding: 15 }}
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
    </Pressable>
  );
};

export default NftMarketPreviewItem;
