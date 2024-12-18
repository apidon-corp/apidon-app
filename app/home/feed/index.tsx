import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import Post from "@/components/Post/Post";
import { useAtom, useAtomValue } from "jotai";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  ViewToken,
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
import { collectCollectibleAtom } from "@/atoms/collectCollectibleAtom";

import { View } from "@/components/Themed";
import { useFollowing } from "@/components/Feed/useFollowing";

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

  const [collectCollectibleAtomValue, setCollectCollectibleAtom] = useAtom(
    collectCollectibleAtom
  );

  const [viewablePostDocPaths, setViewablePostDocPaths] = useState<string[]>(
    []
  );

  const flatListRef = useRef<FlatList>(null);

  const isIOS = Platform.OS === "ios";

  const {
   // followingPostDocPaths,
   // getInitialFollowingPosts,
   // getMoreFollowingPosts,
  } = useFollowingPosts();

  const {followingPostDocPaths, getFollowingPosts} = useFollowing()

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

      if (viewablePostDocPaths.length !== 0)
        flatListRef.current?.scrollToIndex({ index: 0, animated: true });
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
      getFollowingPosts();
    }
  }, [panelName]);

  /**
   * Manage collecting collectible with linking
   */
  useEffect(() => {
    if (!collectCollectibleAtomValue) return;

    const code = collectCollectibleAtomValue.code;
    if (!code) return setCollectCollectibleAtom(undefined);

    codeEnteringBottomSheetModalRef.current?.present();
  }, [collectCollectibleAtomValue]);

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
      await getFollowingPosts();
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
      else if (panelName === "following") getFollowingPosts();
    }
  };

  const handlePressCodeEnterButton = () => {
    codeEnteringBottomSheetModalRef.current?.present();
  };

  const onViewableItemsChanged = ({
    viewableItems,
    changed,
  }: {
    viewableItems: ViewToken[];
    changed: ViewToken[];
  }) => {
    setViewablePostDocPaths(viewableItems.map((item) => item.key));
  };

  const renderItem = useCallback(
    ({ item }: any) =>
      isIOS ? (
        <Post
          postDocPath={item}
          key={item}
          deletePostDocPathFromArray={deletePostDocPathFromArray}
        />
      ) : (
        <Post
          postDocPath={item}
          viewablePostDocPaths={viewablePostDocPaths}
          deletePostDocPathFromArray={deletePostDocPathFromArray}
        />
      ),
    [viewablePostDocPaths]
  );

  const listData = useMemo(
    () =>
      Array.from(
        new Set(panelName === "all" ? postDocPaths : followingPostDocPaths)
      ),
    [panelName, postDocPaths, followingPostDocPaths]
  );

  const deletePostDocPathFromArray = (postDocPath: string) => {
    setPostDocPaths((prev) => prev.filter((q) => q !== postDocPath));
    setPostDocSnapshots((prev) =>
      prev.filter((q) => q.data().postDocPath !== postDocPath)
    );
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
                width: 45,
              }}
            >
              <AntDesign name="qrcode" size={24} color="white" />
            </Pressable>
          ),
        }}
      />

      {isIOS ? (
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
                data={listData}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            </>
          )}

          <View
            style={{
              width: "100%",
              height: 50,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator size={32} color="gray" />
          </View>
        </ScrollView>
      ) : (
        <FlatList
          ref={flatListRef}
          contentInsetAdjustmentBehavior="automatic"
          style={{
            width: "100%",
          }}
          contentContainerStyle={{
            gap: 20,
            paddingBottom: (bottom || 20) + 60,
          }}
          onScroll={({ nativeEvent }) => handleScroll(nativeEvent)}
          keyExtractor={(item) => item}
          data={listData}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          viewabilityConfig={{
            waitForInteraction: false,
            minimumViewTime: 0,
            viewAreaCoveragePercentThreshold: 0,
          }}
          onViewableItemsChanged={onViewableItemsChanged}
          refreshControl={
            <RefreshControl
              refreshing={refreshLoading}
              onRefresh={handleRefresh}
            />
          }
          scrollToOverflowEnabled
          ListHeaderComponent={
            <Pagination panelName={panelName} setPanelName={setPanelName} />
          }
        />
      )}

      <CustomBottomModalSheet
        ref={codeEnteringBottomSheetModalRef}
        backgroundColor="#1B1B1B"
      >
        <CodeEnteringBottomSheetContent
          bottomSheetModalRef={codeEnteringBottomSheetModalRef}
          collectibleCodeParamter={collectCollectibleAtomValue?.code || ""}
        />
      </CustomBottomModalSheet>
    </>
  );
};

export default index;
