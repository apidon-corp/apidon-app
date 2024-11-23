import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import Post from "@/components/Post/Post";
import { useAtom, useAtomValue } from "jotai";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  NativeScrollEvent,
  Pressable,
  RefreshControl,
  ScrollView,
} from "react-native";

import { homeScreeenParametersAtom } from "@/atoms/homeScreenAtom";
import PostSkeleton from "@/components/Post/PostSkeleon";

import { PostDataOnMainPostsCollection } from "@/types/Post";
import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CustomBottomModalSheet from "@/components/BottomSheet/CustomBottomModalSheet";
import CodeEnteringBottomSheetContent from "@/components/Collectible/CodeEnteringBottomSheetContent";
import Pagination from "@/components/Feed/Pagination";
import { AntDesign } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useHeaderHeight } from "@react-navigation/elements";
import { Stack } from "expo-router";

import { useFollowingPosts } from "@/components/Feed/useFollowingPosts";

const index = () => {
  const screenParameters = useAtomValue(screenParametersAtom);

  const createdPostDocPath = screenParameters.find(
    (q) => q.queryId === "createdPostDocPath"
  )?.value as string | undefined;

  const [refreshLoading, setRefreshLoading] = useState(false);
  const [homeScreenParametersValue, setHomeScreenParameters] = useAtom(
    homeScreeenParametersAtom
  );

  const scrollViewRef = useRef<ScrollView>(null);

  const [postDocSnapshots, setPostDocSnapshots] = useState<
    FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>[]
  >([]);
  const [postDocPaths, setPostDocPaths] = useState<string[]>([]);

  const { bottom } = useSafeAreaInsets();

  const headerHeight = useHeaderHeight();

  const codeEnteringBottomSheetModalRef = useRef<BottomSheetModal>(null);

  const [panelName, setPanelName] = useState<"all" | "following">("all");

  const {
    followingPostDocPaths,
    getInitialFollowingPosts,
    getMoreFollowingPosts,
  } = useFollowingPosts();

  // Managing created post.
  useEffect(() => {
    if (!createdPostDocPath) return;
    if (postDocPaths.includes(createdPostDocPath)) return;

    setPanelName("all");

    setPostDocPaths((prev) => [createdPostDocPath, ...prev]);

    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: -headerHeight + 1 });
      setHomeScreenParameters({ isHomeButtonPressed: false });
    }, 500);
  }, [createdPostDocPath]);

  // Manage pressing home button.
  useEffect(() => {
    if (homeScreenParametersValue.isHomeButtonPressed) {
      scrollViewRef.current?.scrollTo({ y: -headerHeight + 1 });
    }
  }, [homeScreenParametersValue]);

  /**
   * Gets initial posts for both all and followings.
   * Also, this useEffect behaves like a switchcase for panelName.
   * If panelName is all, it gets initial posts for all.
   * If panelName is following, it gets initial posts for followings.
   */
  useEffect(() => {
    if (panelName === "all") {
      getInitialPostDocPaths();
    } else if (panelName === "following") {
      getInitialFollowingPosts();
    }
  }, [panelName]);

  async function getInitialPostDocPaths() {
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

    if (panelName === "all") {
      await getInitialPostDocPaths();
    } else {
      console.log("refreshing following");
    }

    setRefreshLoading(false);
  }

  const handleScroll = (event: NativeScrollEvent) => {
    const threshold = 1000;

    const { layoutMeasurement, contentOffset, contentSize } = event;

    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - threshold;
    if (isCloseToBottom) {
      if (panelName === "all") getMorePostDocPaths();
      else if (panelName === "following") getMoreFollowingPosts();
    }
  };

  const handlePressCodeEnterButton = () => {
    codeEnteringBottomSheetModalRef.current?.present();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable
              onPress={handlePressCodeEnterButton}
              style={{
                justifyContent: "center",
                alignItems: "flex-start",
                width: 75,
              }}
            >
              <AntDesign name="qrcode" size={24} color="white" />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        ref={scrollViewRef}
        onScroll={({ nativeEvent }) => handleScroll(nativeEvent)}
        scrollEventThrottle={500}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshLoading}
            onRefresh={handleRefresh}
          />
        }
        contentContainerStyle={{
          paddingBottom: (bottom || 20) + 60,
        }}
        scrollToOverflowEnabled
      >
        <Pagination panelName={panelName} setPanelName={setPanelName} />

        {postDocPaths.length === 0 ? (
          <FlatList
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            data={[1, 2]}
            renderItem={({ item }) => <PostSkeleton key={item} />}
            contentContainerStyle={{
              width: "100%",
              gap: 10,
            }}
          />
        ) : (
          <>
            <FlatList
              style={{
                width: "100%",
              }}
              contentContainerStyle={{
                gap: 20,
              }}
              keyExtractor={(item) => item}
              data={Array.from(
                new Set(
                  panelName === "all" ? postDocPaths : followingPostDocPaths
                )
              )}
              renderItem={({ item }) => <Post postDocPath={item} key={item} />}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </>
        )}
      </ScrollView>

      <CustomBottomModalSheet
        ref={codeEnteringBottomSheetModalRef}
        backgroundColor="#1B1B1B"
      >
        <CodeEnteringBottomSheetContent
          bottomSheetModalRef={codeEnteringBottomSheetModalRef}
        />
      </CustomBottomModalSheet>
    </>
  );
};

export default index;
