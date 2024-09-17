import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import Text from "@/components/Text/Text";
import UserCard from "@/components/User/UserCard";
import { PostServerData, RateData, RatingData } from "@/types/Post";
import firestore from "@react-native-firebase/firestore";
import { useAtomValue } from "jotai";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, SafeAreaView } from "react-native";

const Likes = () => {
  const screenParameters = useAtomValue(screenParametersAtom);

  const postDocPath = screenParameters.find(
    (query) => query.queryId === "postDocPath"
  )?.value as string;

  const [ratings, setRatings] = useState<RatingData[] | null>(null);

  // Dynamic Data Fetching
  useEffect(() => {
    if (!postDocPath) return;

    const unsubscribe = firestore()
      .doc(postDocPath)
      .collection("ratings")
      .onSnapshot(
        (snapshot) => {
          return setRatings(
            snapshot.docs.map((doc) => doc.data() as RatingData)
          );
        },
        (error) => {
          console.error("Error on getting realtime data: ", error);
          return setRatings(null);
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

  if (!ratings)
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

  if (ratings.length === 0) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>No rates yet.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <FlatList
        contentContainerStyle={{
          gap: 5,
          paddingHorizontal: 10,
        }}
        data={ratings}
        renderItem={({ item }) => (
          <UserCard username={item.sender} key={item.sender} />
        )}
      />
    </SafeAreaView>
  );
};

export default Likes;
