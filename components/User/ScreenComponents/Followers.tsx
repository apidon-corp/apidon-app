import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  ScrollView,
} from "react-native";

import Text from "@/components/Text/Text";
import UserCard from "@/components/User/UserCard";
import { FollowerDocData } from "@/types/User";
import firestore from "@react-native-firebase/firestore";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FollowerData = {
  follower: string;
  followTime: number;
};

const followers = () => {
  const { username } = useLocalSearchParams() as { username: string };

  const [loading, setLoading] = useState(false);

  const [followerDatas, setFollowerDatas] = useState<FollowerData[]>([]);

  const { bottom } = useSafeAreaInsets();

  useEffect(() => {
    handleGetInitialData();
  }, []);

  const handleGetInitialData = async () => {
    if (loading) return;
    if (!username) return;

    setLoading(true);

    try {
      const followerDocs = (
        await firestore()
          .collection(`users/${username}/followers`)
          .orderBy("followTime", "desc")
          .get()
      ).docs;

      const followerDatas = followerDocs.map((followerDoc) => {
        return {
          follower: followerDoc.id,
          followTime: (followerDoc.data() as FollowerDocData).followTime,
        };
      }) as FollowerData[];

      setFollowerDatas(followerDatas);
      return setLoading(false);
    } catch (error) {
      console.error("Error on getting initial data: ", error);
      return setLoading(false);
    }
  };

  if (loading)
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

  if (followerDatas.length === 0) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text>No followers yet.</Text>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: (bottom || 20) + 60,
        paddingHorizontal: 15,
      }}
    >
      <FlatList
        scrollEnabled={false}
        data={followerDatas}
        renderItem={({ item }) => (
          <UserCard username={item.follower} key={item.follower} />
        )}
      />
    </ScrollView>
  );
};

export default followers;
