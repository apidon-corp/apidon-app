import { apidonPink } from "@/constants/Colors";
import { firestore } from "@/firebase/client";
import { useAuth } from "@/providers/AuthProvider";
import { PostServerData } from "@/types/Post";
import { UserInServer } from "@/types/User";
import { FontAwesome5 } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import Text from "../Text/Text";

type Props = {
  postDocPath: string;
};

const NftPreview = ({ postDocPath }: Props) => {
  const [postDocData, setPostDocData] = useState<PostServerData | null>(null);
  const [postSenderData, setPostSenderData] = useState<UserInServer | null>(
    null
  );

  const authStatus = useAuth();

  // Dynamic Data Fetching / Post Object
  useEffect(() => {
    if (authStatus !== "authenticated") return;

    const postDocRef = doc(firestore, postDocPath);
    const unsubscribe = onSnapshot(
      postDocRef,
      (snapshot) => {
        if (!snapshot.exists()) {
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
      const userDocRef = doc(firestore, `/users/${senderUsername}`);

      const userDocSnapshot = await getDoc(userDocRef);
      if (!userDocSnapshot.exists()) return setPostSenderData(null);

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
      `/home/(nft-market)/post?sender=${postDocData.senderUsername}&id=${postDocData.id}`
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
            gap: 4,
          }}
        >
          <FontAwesome5 name="lira-sign" size={13} color="#036704" />
          <Text
            style={{
              color: "#036704",
              fontSize: 13,
            }}
            bold
          >
            53
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
            source={postSenderData.profilePhoto}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
            }}
          />
        </View>
      </View>
    </Pressable>
  );
};

export default NftPreview;
