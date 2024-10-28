import Text from "@/components/Text/Text";
import UserCard from "@/components/User/UserCard";
import { RatingData } from "@/types/Post";
import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
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
  let postDocPath = "";
  if (!sender || !id) postDocPath = "";
  postDocPath = `users/${sender}/posts/${id}`;

  const [ratingDocs, setRatingDocs] = useState<
    | FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>[]
    | null
  >(null);

  useEffect(() => {
    handleFetchInitialRatings();
  }, []);

  const handleFetchInitialRatings = async () => {
    if (!postDocPath) return;

    try {
      const ratingDocSnapshots = await firestore()
        .doc(postDocPath)
        .collection("ratings")
        .orderBy("timestamp", "desc")
        .limit(15)
        .get();

      setRatingDocs(ratingDocSnapshots.docs);
    } catch (error) {
      console.error("Error on getting initial ratings: ", error);
      setRatingDocs(null);
    }
  };

  const serveMoreRatings = async () => {
    if (!postDocPath) return;
    if (!ratingDocs) return;

    const lastDoc = ratingDocs[ratingDocs.length - 1];
    if (!lastDoc) return;

    try {
      const query = await firestore()
        .doc(postDocPath)
        .collection("ratings")
        .orderBy("timestamp", "desc")
        .startAfter(lastDoc)
        .limit(5)
        .get();

      setRatingDocs((prev) => [
        ...(prev as FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>[]),
        ...query.docs,
      ]);
    } catch (error) {
      console.error("Error on serving more ratings: ", error);
    }
  };

  const handleScroll = (event: NativeScrollEvent) => {
    const threshold = 50;

    const { layoutMeasurement, contentOffset, contentSize } = event;

    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - threshold;
    if (isCloseToBottom) {
      serveMoreRatings();
    }
  };

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

  if (!ratingDocs)
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color="white" />
      </SafeAreaView>
    );

  if (ratingDocs.length === 0) {
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
      showsVerticalScrollIndicator={false}
      onScroll={({ nativeEvent }) => handleScroll(nativeEvent)}
      scrollEventThrottle={500}
    >
      <FlatList
        scrollEnabled={false}
        contentContainerStyle={{
          gap: 5,
          paddingHorizontal: 10,
        }}
        data={Array.from(new Set(ratingDocs)).map(
          (d) => d.data() as RatingData
        )}
        renderItem={({ item }) => (
          <UserCard username={item.sender} key={item.sender} />
        )}
        keyExtractor={(item) => item.sender}
      />
    </ScrollView>
  );
};

export default Rates;
