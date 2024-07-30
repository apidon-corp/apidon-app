import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import Post from "@/components/Post/Post";
import apiRoutes from "@/helpers/ApiRoutes";
import { useAtomValue } from "jotai";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  SafeAreaView,
  ScrollView,
} from "react-native";

import auth from "@react-native-firebase/auth";
import appCheck from "@react-native-firebase/app-check";
import PostSkeleton from "@/components/Post/PostSkeleon";

const index = () => {
  const [loading, setLoading] = useState(false);
  const [recommendedPostsDocPathArray, setRecommendedPostsDocPathArray] =
    useState<string[]>([]);

  const [servedPosts, setServedPosts] = useState<string[]>([]);

  const screenParameters = useAtomValue(screenParametersAtom);

  const createdPostDocPath = screenParameters.find(
    (q) => q.queryId === "createdPostDocPath"
  )?.value as string | undefined;

  useEffect(() => {
    if (!createdPostDocPath) return;

    setServedPosts((prev) => {
      if (prev.includes(createdPostDocPath)) return prev;
      return [createdPostDocPath, ...prev];
    });
  }, [createdPostDocPath]);

  useEffect(() => {
    handleGetPostRecommendations();
  }, []);

  /**
   * Fetches paths of recommended posts from server.
   * @returns
   */
  const handleGetPostRecommendations = async () => {
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

  if (loading)
    return (
      <SafeAreaView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <FlatList
          data={[1, 2]}
          renderItem={({ item }) => <PostSkeleton key={item} />}
          contentContainerStyle={{
            gap: 20,
          }}
        />
      </SafeAreaView>
    );

  return (
    <ScrollView
      onScroll={({ nativeEvent }) => handleScroll(nativeEvent)}
      scrollEventThrottle={500}
      showsVerticalScrollIndicator={false}
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
