import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import Post from "@/components/Post/Post";
import apiRoutes from "@/helpers/ApiRoutes";
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
import appCheck from "@react-native-firebase/app-check";
import auth from "@react-native-firebase/auth";

const index = () => {
  const [loading, setLoading] = useState(false);
  const [recommendedPostsDocPathArray, setRecommendedPostsDocPathArray] =
    useState<string[]>([]);

  const [servedPosts, setServedPosts] = useState<string[]>([]);

  const screenParameters = useAtomValue(screenParametersAtom);

  const createdPostDocPath = screenParameters.find(
    (q) => q.queryId === "createdPostDocPath"
  )?.value as string | undefined;

  const [refreshLoading, setRefreshLoading] = useState(false);
  const [homeScreenParametersValue, setHomeScreenParameters] = useAtom(
    homeScreeenParametersAtom
  );

  const scrollViewRef = useRef<ScrollView>(null);
  const isHandlingHomeButtonPress = useRef<boolean>(false);

  useEffect(() => {
    if (!createdPostDocPath) return;

    setServedPosts((prev) => {
      if (prev.includes(createdPostDocPath)) return prev;
      return [createdPostDocPath, ...prev];
    });
  }, [createdPostDocPath]);

  useEffect(() => {
    handleGetInitialPostRecommendations();
  }, []);

  useEffect(() => {
    if (!homeScreenParametersValue.isHomeButtonPressed) return;
    if (refreshLoading) return;
    if (isHandlingHomeButtonPress.current) return;

    handleHomeButtonPress();
  }, [
    homeScreenParametersValue.isHomeButtonPressed,
    refreshLoading,
    isHandlingHomeButtonPress,
  ]);

  /**
   * Fetches paths of recommended posts from server.
   * @returns
   */
  const handleGetInitialPostRecommendations = async () => {
    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return false;

    if (loading) return false;

    setLoading(true);

    try {
      const idToken = await currentUserAuthObject.getIdToken();

      const { token: appchecktoken } = await appCheck().getLimitedUseToken();

      const response = await fetch(apiRoutes.feed.getPersonalizedFeed, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
          appchecktoken,
        },
      });

      if (!response.ok) {
        const message = await response.text();
        console.error(
          "Response from getPersonalizedMainFeed API is not okay: ",
          message
        );
        setLoading(false);
        return setRecommendedPostsDocPathArray([]);
      }

      const result = await response.json();

      const postDocPathArrayFetched = result.postDocPathArray as string[];

      if (createdPostDocPath)
        postDocPathArrayFetched.unshift(createdPostDocPath);

      // We are removing first "/" from post doc path because react native firebase firestore doesn't like it.
      const unSlicedAtFirstPostDocPathArrayFetched =
        postDocPathArrayFetched.map((p) => {
          if (p[0] === "/") return p.slice(1);
          return p;
        });

      const onlyFourPosts = unSlicedAtFirstPostDocPathArrayFetched.slice(0, 4);

      setRecommendedPostsDocPathArray(unSlicedAtFirstPostDocPathArrayFetched);
      setLoading(false);
      return setServedPosts(onlyFourPosts);
    } catch (error) {
      console.error("Error while fetching getPersonalizedMainFeed: ", error);
      setLoading(false);
      return setRecommendedPostsDocPathArray([]);
    }
  };

  const handleScroll = (event: NativeScrollEvent) => {
    const threshold = 500;

    const { layoutMeasurement, contentOffset, contentSize } = event;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - threshold;
    if (isCloseToBottom) {
      serveMorePosts();
    }
  };

  const serveMorePosts = () => {
    if (servedPosts.length === recommendedPostsDocPathArray.length) {
      console.log("No more posts to serve.");
      return;
    }

    setServedPosts((prev) => {
      return [
        ...prev,
        ...recommendedPostsDocPathArray.slice(prev.length, prev.length + 4),
      ];
    });
  };

  const handleRefresh = async () => {
    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return false;

    setRefreshLoading(true);

    try {
      const idToken = await currentUserAuthObject.getIdToken();

      const { token: appchecktoken } = await appCheck().getLimitedUseToken();

      const response = await fetch(apiRoutes.feed.getPersonalizedFeed, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
          appchecktoken,
        },
      });

      if (!response.ok) {
        const message = await response.text();
        console.error(
          "Response from getPersonalizedMainFeed API is not okay: ",
          message
        );
        setRefreshLoading(false);
        return setRecommendedPostsDocPathArray([]);
      }

      const result = await response.json();

      const postDocPathArrayFetched = result.postDocPathArray as string[];

      // We are removing first "/" from post doc path because react native firebase firestore doesn't like it.
      const unSlicedAtFirstPostDocPathArrayFetched =
        postDocPathArrayFetched.map((p) => {
          if (p[0] === "/") return p.slice(1);
          return p;
        });
      setRecommendedPostsDocPathArray(unSlicedAtFirstPostDocPathArrayFetched);

      const onlyFourPosts = unSlicedAtFirstPostDocPathArrayFetched.slice(0, 4);
      setServedPosts(onlyFourPosts);

      return setRefreshLoading(false);
    } catch (error) {
      console.error("Error while fetching getPersonalizedMainFeed: ", error);

      setRecommendedPostsDocPathArray([]);
      setServedPosts([]);

      return setRefreshLoading(false);
    }
  };

  const handleHomeButtonPress = async () => {
    if (!homeScreenParametersValue.isHomeButtonPressed) return;
    if (refreshLoading) return;
    if (!scrollViewRef.current) return;
    if (isHandlingHomeButtonPress.current) return;

    isHandlingHomeButtonPress.current = true;

    scrollViewRef.current.scrollTo({ y: 0, animated: true });

    await handleRefresh();
    setHomeScreenParameters({ isHomeButtonPressed: false });
    isHandlingHomeButtonPress.current = false;
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
    >
      <FlatList
        style={{
          width: "100%",
        }}
        contentContainerStyle={{
          gap: 20,
        }}
        keyExtractor={(item) => item}
        data={servedPosts}
        renderItem={({ item }) => <Post postDocPath={item} key={item} />}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </ScrollView>
  );
};

export default index;
