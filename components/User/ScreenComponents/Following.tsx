import UserCard from "@/components/User/UserCard";
import { FollowerDocData } from "@/types/User";
import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  SafeAreaView,
  ScrollView,
} from "react-native";

import Text from "@/components/Text/Text";
import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FollowingData = {
  following: string;
  followTime: number;
};

const Following = () => {
  const { bottom } = useSafeAreaInsets();
  const { username } = useLocalSearchParams() as { username: string };

  const [followingList, setFollowingList] = useState<FollowingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastDoc, setLastDoc] =
    useState<FirebaseFirestoreTypes.QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const handleGetInitialData = useCallback(async () => {
    if (!username) return;
    setIsLoading(true);

    try {
      const query = await firestore()
        .collection(`users/${username}/followings`)
        .orderBy("followTime", "desc")
        .limit(15)
        .get();

      const followings = query.docs.map((doc) => ({
        following: doc.id,
        followTime: (doc.data() as FollowerDocData).followTime,
      }));

      setFollowingList(followings);
      setLastDoc(query.docs[query.docs.length - 1] || null);
      setHasMore(query.docs.length === 15);
    } catch (error) {
      console.error("Error on getting initial followings: ", error);
      setFollowingList([]);
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  const serveMoreFollowings = async () => {
    if (!username || !hasMore || !lastDoc || isLoading) return;

    setIsLoading(true);

    try {
      const query = await firestore()
        .collection(`users/${username}/followings`)
        .orderBy("followTime", "desc")
        .startAfter(lastDoc)
        .limit(5)
        .get();

      const newFollowings = query.docs.map((doc) => ({
        following: doc.id,
        followTime: (doc.data() as FollowerDocData).followTime,
      }));

      setFollowingList((prev) => [...prev, ...newFollowings]);
      setLastDoc(query.docs[query.docs.length - 1] || lastDoc);
      setHasMore(query.docs.length === 5);
    } catch (error) {
      console.error("Error on serving more followings: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = useCallback(
    ({ layoutMeasurement, contentOffset, contentSize }: NativeScrollEvent) => {
      const threshold = 50;
      const isCloseToBottom =
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - threshold;

      if (isCloseToBottom && !isLoading && hasMore) {
        serveMoreFollowings();
      }
    },
    [isLoading, hasMore]
  );

  useEffect(() => {
    handleGetInitialData();
  }, [handleGetInitialData]);

  if (isLoading && followingList.length === 0) {
    return (
      <SafeAreaView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator size="small" />
      </SafeAreaView>
    );
  }

  if (followingList.length === 0) {
    return (
      <SafeAreaView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <Text>{username} is not following anyone.</Text>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: (bottom || 20) + 60,
        padding: 10,
        gap: 5,
      }}
      showsVerticalScrollIndicator={false}
      onScroll={({ nativeEvent }) => handleScroll(nativeEvent)}
      scrollEventThrottle={500}
    >
      <FlatList
        scrollEnabled={false}
        data={followingList}
        renderItem={({ item }) => (
          <UserCard username={item.following} key={item.following} />
        )}
        keyExtractor={(item) => item.following}
        ListFooterComponent={
          isLoading ? (
            <ActivityIndicator size="small" style={{ marginTop: 10 }} />
          ) : null
        }
      />
    </ScrollView>
  );
};

export default Following;
