import { apidonPink } from "@/constants/Colors";
import { useAuth } from "@/providers/AuthProvider";
import { CollectibleDocData } from "@/types/Collectible";
import { PostServerData } from "@/types/Post";
import { UserInServer } from "@/types/User";
import { Foundation } from "@expo/vector-icons";
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

const NftOnUserPreviewItem = ({ postDocPath, collectibleDocPath }: Props) => {
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
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          padding: 5,
          opacity: 0.85,
        }}
      >
        <View
          style={{
            paddingHorizontal: 10,
            flexDirection: "row",
            backgroundColor: "white",
            borderRadius: 10,
            alignItems: "center",
            gap: 1,
          }}
        >
          <Foundation name="dollar" size={20} color="#036704" />
          <Text
            style={{
              color: "#036704",
              fontSize: 13,
            }}
            bold
          >
            {collectibleDocData.price.price}
          </Text>
        </View>
      </View>

      <View
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          padding: 5,
          opacity: 1,
        }}
      >
        <View
          style={{
            paddingHorizontal: 5,
            flexDirection: "row",
            backgroundColor: "white",
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "purple",
              fontSize: 12,
            }}
            bold
          >
            {collectibleDocData.stock.remainingStock} out of{" "}
            {collectibleDocData.stock.initialStock}
          </Text>
        </View>
      </View>

      <View style={{ position: "absolute", bottom: 20, left: 20, padding: 5 }}>
        <View
          style={{
            alignItems: "center",
            borderRadius: 10,
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
        </View>
      </View>
    </Pressable>
  );
};

export default NftOnUserPreviewItem;
