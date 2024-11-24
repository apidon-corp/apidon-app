import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  SafeAreaView,
  ScrollView,
} from "react-native";

import Text from "@/components/Text/Text";
import UserCard from "@/components/User/UserCard";
import { FollowerDocData } from "@/types/User";
import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FollowerData = {
  follower: string;
  followTime: number;
};

const Followers = () => {
  const { username } = useLocalSearchParams() as { username: string };
  const { bottom } = useSafeAreaInsets();

  const [followersList, setFollowersList] = useState<FollowerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastDoc, setLastDoc] =
    useState<FirebaseFirestoreTypes.QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const handleGetInitialData = useCallback(async () => {
    if (!username) return;
    setIsLoading(true);

    try {
      const query = await firestore()
        .collection(`users/${username}/followers`)
        .orderBy("followTime", "desc")
        .limit(15)
        .get();

      const followers = query.docs.map((doc) => ({
        follower: doc.id,
        followTime: (doc.data() as FollowerDocData).followTime,
      }));

      setFollowersList(followers);
      setLastDoc(query.docs[query.docs.length - 1] || null);
      setHasMore(query.docs.length === 15);
    } catch (error) {
      console.error("Error on getting initial followers: ", error);
      setFollowersList([]);
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  const serveMoreFollowers = async () => {
    if (!username || !hasMore || !lastDoc || isLoading) return;

    setIsLoading(true);

    try {
      const query = await firestore()
        .collection(`users/${username}/followers`)
        .orderBy("followTime", "desc")
        .startAfter(lastDoc)
        .limit(5)
        .get();

      const newFollowers = query.docs.map((doc) => ({
        follower: doc.id,
        followTime: (doc.data() as FollowerDocData).followTime,
      }));

      setFollowersList((prev) => [...prev, ...newFollowers]);
      setLastDoc(query.docs[query.docs.length - 1] || lastDoc);
      setHasMore(query.docs.length === 5);
    } catch (error) {
      console.error("Error on serving more followers: ", error);
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
        serveMoreFollowers();
      }
    },
    [isLoading, hasMore]
  );

  useEffect(() => {
    handleGetInitialData();
  }, [handleGetInitialData]);

  if (isLoading && followersList.length === 0) {
    return (
      <SafeAreaView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator size="small" />
      </SafeAreaView>
    );
  }

  if (followersList.length === 0) {
    return (
      <SafeAreaView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <Text>{username} is not being followed by anyone.</Text>
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
      onScroll={({ nativeEvent }) => handleScroll(nativeEvent)}
      scrollEventThrottle={500}
    >
      <FlatList
        scrollEnabled={false}
        data={followersList}
        renderItem={({ item }) => (
          <UserCard username={item.follower} key={item.follower} />
        )}
        keyExtractor={(item) => item.follower}
        ListFooterComponent={
          isLoading ? (
            <ActivityIndicator size="small" style={{ marginTop: 10 }} />
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </ScrollView>
  );
};

export default Followers;
