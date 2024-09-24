import Text from "@/components/Text/Text";
import UserCard from "@/components/User/UserCard";
import { RatingData } from "@/types/Post";
import firestore from "@react-native-firebase/firestore";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Rates = () => {
  const { bottom } = useSafeAreaInsets();

  const { sender, id } = useLocalSearchParams<{
    sender: string;
    id: string;
  }>();

  const [ratings, setRatings] = useState<RatingData[] | null>(null);

  const postDocPath = `users/${sender}/posts/${id}`;

  // Dynamic Data Fetching
  useEffect(() => {
    if (!sender || !id) return;

    const unsubscribe = firestore()
      .doc(postDocPath)
      .collection("ratings")
      .orderBy("timestamp", "desc")
      .onSnapshot(
        (snapshot) => {
          return setRatings(
            snapshot.docs.map((doc) => doc.data() as RatingData)
          );
        },
        (error) => {
          console.error("Error on getting realtime data: ", error);
          setRatings(null);
        }
      );

    return () => unsubscribe();
  }, [postDocPath]);

  if (!sender || !id)
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
    <ScrollView
      contentContainerStyle={{
        paddingBottom: (bottom | 20) + 60,
      }}
    >
      <FlatList
        scrollEnabled={false}
        contentContainerStyle={{
          gap: 5,
          paddingHorizontal: 10,
        }}
        data={ratings}
        renderItem={({ item }) => (
          <UserCard username={item.sender} key={item.sender} />
        )}
      />
    </ScrollView>
  );
};

export default Rates;
