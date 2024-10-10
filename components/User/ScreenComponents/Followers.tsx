import React, { useEffect, useState } from "react";
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

const followers = () => {
  const { username } = useLocalSearchParams() as { username: string };

  const [followerDocs, setFollowerDocs] = useState<
    | FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>[]
    | null
  >(null);

  const { bottom } = useSafeAreaInsets();

  useEffect(() => {
    handleGetInitialData();
  }, []);

  const handleGetInitialData = async () => {
    if (!username) return;

    try {
      const followerDocsSnapshots = await firestore()
        .collection(`users/${username}/followers`)
        .orderBy("followTime", "desc")
        .limit(15)
        .get();

      setFollowerDocs(followerDocsSnapshots.docs);
    } catch (error) {
      console.error("Error on getting initial followers: ", error);
      setFollowerDocs(null);
    }
  };

  const serveMoreFollowers = async () => {
    if (!username) return setFollowerDocs(null);

    if (!followerDocs) return setFollowerDocs(null);

    const lastDoc = followerDocs[followerDocs.length - 1];
    if (!lastDoc) return setFollowerDocs(null);

    try {
      const query = await firestore()
        .collection(`users/${username}/followers`)
        .orderBy("followTime", "desc")
        .startAfter(lastDoc)
        .limit(5)
        .get();

      setFollowerDocs((prev) => [
        ...(prev as FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>[]),
        ...query.docs,
      ]);
    } catch (error) {
      console.error("Error on serving more followers: ", error);
    }
  };

  const handleScroll = (event: NativeScrollEvent) => {
    const threshold = 50;

    const { layoutMeasurement, contentOffset, contentSize } = event;

    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - threshold;
    if (isCloseToBottom) {
      serveMoreFollowers();
    }
  };

  if (!followerDocs) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="small" />
      </SafeAreaView>
    );
  }

  if (followerDocs.length === 0) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
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
        data={followerDocs.map((fd) => {
          const followerData: FollowerData = {
            follower: fd.id,
            followTime: (fd.data() as FollowerDocData).followTime,
          };

          return followerData;
        })}
        renderItem={({ item }) => (
          <UserCard username={item.follower} key={item.follower} />
        )}
      />
    </ScrollView>
  );
};

export default followers;
