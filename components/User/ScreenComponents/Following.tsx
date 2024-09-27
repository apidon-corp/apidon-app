import UserCard from "@/components/User/UserCard";
import { FollowerDocData } from "@/types/User";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  ScrollView,
} from "react-native";

import Text from "@/components/Text/Text";
import firestore from "@react-native-firebase/firestore";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FollowingData = {
  following: string;
  followTime: number;
};

const following = () => {
  const { bottom } = useSafeAreaInsets();

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
    <ScrollView
      contentContainerStyle={{
        paddingBottom: (bottom || 20) + 60,
      }}
      showsVerticalScrollIndicator={false}
    >
      <FlatList
        scrollEnabled={false}
        data={followingsData}
        renderItem={({ item }) => (
          <UserCard username={item.following} key={item.following} />
        )}
        contentContainerStyle={{
          padding: 10,
          gap: 5,
        }}
      />
    </ScrollView>
  );
};

export default following;
