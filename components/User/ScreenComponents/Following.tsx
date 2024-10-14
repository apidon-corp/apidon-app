import UserCard from "@/components/User/UserCard";
import { FollowerDocData } from "@/types/User";
import React, { useEffect, useState } from "react";
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

const following = () => {
  const { bottom } = useSafeAreaInsets();

  const { username } = useLocalSearchParams() as { username: string };

  const [followingDocs, setFollowingDocs] = useState<
    | FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>[]
    | null
  >(null);

  useEffect(() => {
    handleGetInitialData();
  }, []);

  const handleGetInitialData = async () => {
    if (!username) return;

    try {
      const query = await firestore()
        .collection(`users/${username}/followings`)
        .orderBy("followTime", "desc")
        .limit(15)
        .get();

      setFollowingDocs(query.docs);
    } catch (error) {
      console.error("Error on getting initial followings: ", error);
      setFollowingDocs(null);
    }
  };

  const serveMoreFollowings = async () => {
    if (!username) return setFollowingDocs(null);

    if (!followingDocs) return setFollowingDocs(null);

    const lastDoc = followingDocs[followingDocs.length - 1];
    if (!lastDoc) return setFollowingDocs(null);

    try {
      const query = await firestore()
        .collection(`users/${username}/followers`)
        .orderBy("followTime", "desc")
        .startAfter(lastDoc)
        .limit(5)
        .get();

      setFollowingDocs((prev) => [
        ...(prev as FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>[]),
        ...query.docs,
      ]);
    } catch (error) {
      console.error("Error on serving more followings: ", error);
    }
  };

  const handleScroll = (event: NativeScrollEvent) => {
    const threshold = 50;

    const { layoutMeasurement, contentOffset, contentSize } = event;

    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - threshold;
    if (isCloseToBottom) {
      serveMoreFollowings();
    }
  };

  if (!followingDocs) {
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

  if (followingDocs.length === 0) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text>{username} is not following anyone.</Text>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: (bottom || 20) + 60,
      }}
      showsVerticalScrollIndicator={false}
      onScroll={({ nativeEvent }) => handleScroll(nativeEvent)}
      scrollEventThrottle={500}
    >
      <FlatList
        scrollEnabled={false}
        data={Array.from(
          new Set(
            followingDocs.map((fd) => {
              const followingData: FollowingData = {
                following: fd.id,
                followTime: (fd.data() as FollowerDocData).followTime,
              };

              return followingData;
            })
          )
        )}
        renderItem={({ item }) => (
          <UserCard username={item.following} key={item.following} />
        )}
        contentContainerStyle={{
          padding: 10,
          gap: 5,
        }}
      />
    </ScrollView>
  );
};

export default following;
