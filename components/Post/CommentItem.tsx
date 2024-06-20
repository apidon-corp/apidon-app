import { View, ActivityIndicator } from "react-native";
import { Text } from "@/components/Text/Text";
import React, { useEffect, useState } from "react";
import { CommentServerData } from "@/types/Post";
import { ImageWithSkeleton } from "../Image/ImageWithSkeleton";
import { UserInServer } from "@/types/User";
import { firestore } from "@/firebase/client";
import { doc, getDoc } from "firebase/firestore";

const CommentItem = ({ message, sender, ts }: CommentServerData) => {
  const [userData, setUserData] = useState<UserInServer | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetUserData = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const userDocRef = doc(firestore, `/users/${sender}`);

      const userDocSnapshot = await getDoc(userDocRef);

      if (!userDocSnapshot.exists()) return;

      const userDocData = userDocSnapshot.data() as UserInServer;

      setUserData(userDocData);
      return setLoading(false);
    } catch (error) {
      console.error("Error on getting initial data: ", error);
      return setLoading(false);
    }
  };

  useEffect(() => {
    if (sender) handleGetUserData();
  }, [sender]);

  if (loading || !userData)
    return (
      <View
        style={{
          borderWidth: 1,
          borderColor: "red",
          width: "100%",
          height: 75,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color="white" />
      </View>
    );

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: "green",
        width: "100%",
        flexDirection: "row",
        gap: 10,
        padding: 5,
        alignItems: "center",
      }}
    >
      <ImageWithSkeleton
        source={{
          uri: userData.profilePhoto,
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
        style={{
          gap: 4,
          width: "80%",
        }}
      >
        <Text bold>{userData.username}</Text>
        <Text>{message}</Text>
      </View>
    </View>
  );
};

export default CommentItem;
