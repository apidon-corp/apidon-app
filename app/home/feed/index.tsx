import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import Post from "@/components/Post/Post";
import { useAtom, useAtomValue } from "jotai";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  NativeScrollEvent,
  RefreshControl,
  SafeAreaView,
  ScrollView,
} from "react-native";

import { homeScreeenParametersAtom } from "@/atoms/homeScreenAtom";
import PostSkeleton from "@/components/Post/PostSkeleon";

import { PostDataOnMainPostsCollection } from "@/types/Post";
import firestore from "@react-native-firebase/firestore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const index = () => {
  const [loading, setLoading] = useState(false);

  const screenParameters = useAtomValue(screenParametersAtom);

  const createdPostDocPath = screenParameters.find(
    (q) => q.queryId === "createdPostDocPath"
  )?.value as string | undefined;

  const [refreshLoading, setRefreshLoading] = useState(false);
  const [homeScreenParametersValue, setHomeScreenParameters] = useAtom(
    homeScreeenParametersAtom
  );

  const scrollViewRef = useRef<ScrollView>(null);

  const [postDocSnapshots, setPostDocSnapshots] = useState<any[]>([]);
  const [postDocPaths, setPostDocPaths] = useState<string[]>([]);

  const [scrollPositionY, setScrollPositionY] = useState(0);

  const { bottom } = useSafeAreaInsets();

  // Getting Initial Post Doc Paths
  useEffect(() => {
    getInitialPostDocPaths();
  }, []);

  // Managing created post.
  useEffect(() => {
    if (!createdPostDocPath) return;
    if (postDocPaths.includes(createdPostDocPath)) return;

    setPostDocPaths((prev) => [createdPostDocPath, ...prev]);

    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0 });
    }
  }, [createdPostDocPath]);

  // Managing Home Button Press
  useEffect(() => {
    if (homeScreenParametersValue.isHomeButtonPressed) {
      scrollViewRef.current?.scrollTo({ y: 0 });

      if (scrollPositionY === 0)
        handleRefresh().then(() => {
          setHomeScreenParameters({
            isHomeButtonPressed: false,
          });
        });
    }
  }, [homeScreenParametersValue, scrollPositionY]);

  async function getInitialPostDocPaths(refreshing?: boolean) {
    if (!refreshing) setLoading(true);

    try {
      const query = await firestore()
        .collection("posts")
        .orderBy("timestamp", "desc")
        .limit(8)
        .get();

      setPostDocSnapshots(query.docs);
      setPostDocPaths(
        query.docs.map(
          (d) => (d.data() as PostDataOnMainPostsCollection).postDocPath
        )
      );
    } catch (error) {
      console.error("Error while fetching getInitialPostDocPaths: ", error);
      setPostDocPaths([]);
    }

    setLoading(false);
  }

  async function getMorePostDocPaths() {
    const lastDoc = postDocSnapshots[postDocSnapshots.length - 1];
    if (!lastDoc) return;

    try {
      const query = await firestore()
        .collection("posts")
        .orderBy("timestamp", "desc")
        .startAfter(lastDoc)
        .limit(8)
        .get();

      setPostDocSnapshots((prev) => [...prev, ...query.docs]);

      setPostDocPaths((prev) => [
        ...prev,
        ...query.docs.map(
          (d) => (d.data() as PostDataOnMainPostsCollection).postDocPath
        ),
      ]);
    } catch (error) {
      console.error("Error while fetching getMorePostDocPaths: ", error);
    }
  }

  async function handleRefresh() {
    if (refreshLoading) return;

    setRefreshLoading(true);
    await getInitialPostDocPaths(true);
    setRefreshLoading(false);
  }

  const handleScroll = (event: NativeScrollEvent) => {
    const threshold = 500;

    const { layoutMeasurement, contentOffset, contentSize } = event;

    setScrollPositionY(contentOffset.y);

    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - threshold;
    if (isCloseToBottom) {
      getMorePostDocPaths();
    }
  };

  if (loading)
    return (
      <SafeAreaView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <FlatList
          data={[1, 2]}
          renderItem={({ item }) => <PostSkeleton key={item} />}
          contentContainerStyle={{
            width: "100%",
            gap: 20,
          }}
        />
      </SafeAreaView>
    );

  return (
    <ScrollView
      ref={scrollViewRef}
      onScroll={({ nativeEvent }) => handleScroll(nativeEvent)}
      scrollEventThrottle={500}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshLoading} onRefresh={handleRefresh} />
      }
      contentContainerStyle={{
        paddingBottom: (bottom || 20) + 60,
      }}
    >
      <FlatList
        style={{
          width: "100%",
        }}
        contentContainerStyle={{
          gap: 20,
        }}
        keyExtractor={(item) => item}
        data={Array.from(new Set(postDocPaths))}
        renderItem={({ item }) => <Post postDocPath={item} key={item} />}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </ScrollView>
  );
};

export default index;
