import { View, SafeAreaView, ActivityIndicator } from "react-native";
import { Text } from "@/components/Text/Text";

import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/firebase/client";
import { PostServerData } from "@/types/Post";
import { ImageWithSkeleton } from "../Image/ImageWithSkeleton";
import { UserInServer } from "@/types/User";

import { AntDesign } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";

type Props = {
  postDocPath: string;
};

const Post = ({ postDocPath }: Props) => {
  const [loading, setLoading] = useState(false);

  const [postDocData, setPostDocData] = useState<PostServerData | null>(null);
  const [postSenderData, setPostSenderData] = useState<UserInServer | null>(
    null
  );

  const handleGetPostInformation = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const postDocRef = doc(firestore, postDocPath);
      const postDocSnapshot = await getDoc(postDocRef);

      if (!postDocSnapshot.exists()) {
        console.log("Post doesnt exist");
        setLoading(false);
        return setPostDocData(null);
      }

      const postDocData = postDocSnapshot.data() as PostServerData;

      setLoading(false);

      handleGetPostSenderInformation(postDocData.senderUsername);

      return setPostDocData(postDocData);
    } catch (error) {
      console.error("Error while fetching post information: ", error);
      setLoading(false);
      return setPostDocData(null);
    }
  };

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

  useEffect(() => {
    handleGetPostInformation();
  }, [postDocPath]);

  if (loading || !postDocData || !postSenderData)
    return (
      <View
        style={{
          width: "100%",
          height: 500,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="white" />
      </View>
    );

  return (
    <View
      id="post-root"
      style={{
        width: "100%",
        height: postDocData.image ? 500 : 150,
      }}
    >
      <View
        id="header"
        style={{
          width: "100%",
          height: 75,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 5,
          gap: 10,
        }}
      >
        <ImageWithSkeleton
          source={{
            uri: postSenderData.profilePhoto,
          }}
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
          }}
          skeletonWidth={50}
          skeletonHeight={50}
          skeletonBorderRadius={25}
        />
        <View
          id="username-fullname-time"
          style={{
            flexDirection: "row",
            gap: 5,
          }}
        >
          <View
            id="username-fullname"
            style={{
              gap: 1,
            }}
          >
            <Text
              bold
              style={{
                fontSize: 15,
              }}
            >
              {postSenderData.username}
            </Text>
            <Text
              style={{
                fontSize: 15,
              }}
            >
              {postSenderData.fullname}
            </Text>
          </View>
        </View>
      </View>

      {postDocData.image && (
        <ImageWithSkeleton
          source={{
            uri: postDocData.image,
          }}
          style={{
            width: "100%",
            height: 350,
          }}
          skeletonWidth="100%"
          skeletonHeight={350}
          skeletonBorderRadius={0}
        />
      )}

      {postDocData.description && (
        <Text
          bold
          style={{
            fontSize: 15,
            height: 25,
            paddingHorizontal: 5,
          }}
        >
          {postDocData.description}
        </Text>
      )}

      <View
        id="footer"
        style={{
          height: 50,
          width: "100%",
          flexDirection: "row",
          paddingHorizontal: 5,
          gap: 10,
        }}
      >
        <View
          id="like"
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 5,
          }}
        >
          <AntDesign name="heart" size={24} color="red" />
          <Text
            style={{
              fontSize: 16,
            }}
          >
            {postDocData.likeCount}
          </Text>
        </View>
        <View
          id="comment"
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 5,
          }}
        >
          <FontAwesome name="comments-o" size={24} color="white" />
          <Text
            style={{
              fontSize: 16,
            }}
          >
            {postDocData.commentCount}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Post;
