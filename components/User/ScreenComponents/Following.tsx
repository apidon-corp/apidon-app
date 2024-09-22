import UserCard from "@/components/User/UserCard";
import { FollowerDocData } from "@/types/User";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, SafeAreaView, View } from "react-native";

import Text from "@/components/Text/Text";
import firestore from "@react-native-firebase/firestore";
import { useLocalSearchParams } from "expo-router";

type FollowingData = {
  following: string;
  followTime: number;
};

const following = () => {
  const { username } = useLocalSearchParams() as { username: string };

  const [loading, setLoading] = useState(false);

  const [followingsData, setFollowingsData] = useState<FollowingData[]>([]);

  useEffect(() => {
    handleGetInitialData();
  }, []);

  const handleGetInitialData = async () => {
    if (!username) return;
    if (loading) return;

    setLoading(true);

    try {
      const followerDocs = (
        await firestore()
          .collection(`users/${username}/followings`)
          .orderBy("followTime", "desc")
          .get()
      ).docs;

      const followerDatas = followerDocs.map((followerDoc) => {
        return {
          following: followerDoc.id,
          followTime: (followerDoc.data() as FollowerDocData).followTime,
        };
      }) as FollowingData[];

      setFollowingsData(followerDatas);
      return setLoading(false);
    } catch (error) {
      console.error("Error on getting initial data: ", error);
      return setLoading(false);
    }
  };

  if (loading || !username)
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color="white" size="large" />
      </SafeAreaView>
    );
  if (followingsData.length === 0) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text>No followings yet.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <View
        style={{
          flex: 1,
        }}
      >
        <FlatList
          data={followingsData}
          renderItem={({ item }) => (
            <UserCard username={item.following} key={item.following} />
          )}
          contentContainerStyle={{
            padding: 10,
            gap: 5,
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default following;
