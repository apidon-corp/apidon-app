import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, SafeAreaView, View } from "react-native";

import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import UserCard from "@/components/User/UserCard";
import { firestore } from "@/firebase/client";
import { FollowerDocData } from "@/types/User";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useAtomValue } from "jotai";

type FollowerData = {
  follower: string;
  followTime: number;
};

const followers = () => {
  const screenParameters = useAtomValue(screenParametersAtom);
  const username = screenParameters.find(
    (query) => query.queryId === "username"
  )?.value as string;

  const [loading, setLoading] = useState(false);

  const [followerDatas, setFollowerDatas] = useState<FollowerData[]>([]);

  useEffect(() => {
    handleGetInitialData();
  }, []);

  const handleGetInitialData = async () => {
    if (loading) return;
    if (!username) return;

    setLoading(true);

    try {
      const followersCollectionRef = collection(
        firestore,
        `/users/${username}/followers`
      );

      const followersQuery = query(
        followersCollectionRef,
        orderBy("followTime", "desc")
      );

      const followerDocs = (await getDocs(followersQuery)).docs;

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
          data={followerDatas}
          renderItem={({ item }) => (
            <UserCard username={item.follower} key={item.follower} />
          )}
          contentContainerStyle={{
            padding: 10,
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default followers;
