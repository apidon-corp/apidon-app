import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import UserCard from "@/components/User/UserCard";
import { firestore } from "@/firebase/client";
import { FollowerDocData } from "@/types/User";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useAtomValue } from "jotai";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, SafeAreaView, View } from "react-native";

type FollowingData = {
  following: string;
  followTime: number;
};

const following = () => {
  const screenParameters = useAtomValue(screenParametersAtom);

  const username = screenParameters.find(
    (query) => query.queryId === "username"
  )?.value as string;

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
      const followingsCollectionRef = collection(
        firestore,
        `/users/${username}/followings`
      );

      const followingsQuery = query(
        followingsCollectionRef,
        orderBy("followTime", "desc")
      );

      const followerDocs = (await getDocs(followingsQuery)).docs;

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
