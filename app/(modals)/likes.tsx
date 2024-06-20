import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import UserCard from "@/components/User/UserCard";
import { firestore } from "@/firebase/client";
import { LikeServerData, PostServerData } from "@/types/Post";
import { doc, onSnapshot } from "firebase/firestore";
import { useAtomValue } from "jotai";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, SafeAreaView, Text } from "react-native";

const Likes = () => {
  const screenParameters = useAtomValue(screenParametersAtom);

  const postDocPath = screenParameters.find(
    (query) => query.queryId === "postDocPath"
  )?.value as string;

  const [loading, setLoading] = useState(false);
  const [likeData, setLikeData] = useState<LikeServerData[]>([]);

  // Dynamic Data Fetching
  useEffect(() => {
    if (!postDocPath) return;

    if (loading) return;
    setLoading(true);

    const postDocRef = doc(firestore, postDocPath);
    const unsubscribe = onSnapshot(
      postDocRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          console.log("Post's realtime data can not be fecthed.");
          return setLoading(false);
        }
        const postDocData = snapshot.data() as PostServerData;
        setLikeData(postDocData.likes);

        return setLoading(false);
      },
      (error) => {
        console.error("Error on getting realtime data: ", error);
        return setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [postDocPath]);

  if (!postDocPath)
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Internal Server Error</Text>
      </SafeAreaView>
    );

  if (loading)
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
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
      <FlatList
        data={likeData}
        renderItem={({ item }) => (
          <UserCard username={item.sender} key={item.sender} />
        )}
      />
    </SafeAreaView>
  );
};

export default Likes;
