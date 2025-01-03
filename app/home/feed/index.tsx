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
  View,
  ViewToken,
} from "react-native";

import { homeScreeenParametersAtom } from "@/atoms/homeScreenAtom";
import PostSkeleton from "@/components/Post/PostSkeleon";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import CustomBottomModalSheet from "@/components/BottomSheet/CustomBottomModalSheet";
import CodeEnteringBottomSheetContent from "@/components/Collectible/CodeEnteringBottomSheetContent";
import Pagination from "@/components/Feed/Pagination";
import { AntDesign } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useHeaderHeight } from "@react-navigation/elements";
import { Stack } from "expo-router";

import { collectCollectibleAtom } from "@/atoms/collectCollectibleAtom";

import { useFollowingPosts } from "@/hooks/useFollowingPosts";
import { useMainPosts } from "@/hooks/useMainPosts";

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
    followingPostDocPaths,
    getFollowingPosts,
    refreshFollowingPosts,
    isGettingFollowingPosts,
  } = useFollowingPosts();

  const {
    getMainPosts,
    isGettingMainPosts,
    mainPostDocPaths,
    addUploadedPostToFeed,
    refreshMainPosts,
    deletePostFromMainFeed,
  } = useMainPosts();

  // Managing created post.
  useEffect(() => {
    if (!createdPostDocPath) return;
    if (mainPostDocPaths.includes(createdPostDocPath)) return;

    setPanelName("all");

    addUploadedPostToFeed(createdPostDocPath);

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
      getMainPosts();
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

  async function handleRefresh() {
    if (refreshLoading) return;

    setRefreshLoading(true);

    if (panelName === "all") {
      await refreshMainPosts();
    } else {
      await refreshFollowingPosts();
    }

    setRefreshLoading(false);
  }

  const handleScroll = useCallback(
    (event: NativeScrollEvent) => {
      const threshold = 1000;
      const { layoutMeasurement, contentOffset, contentSize } = event;

      if (
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - threshold
      ) {
        panelName === "all" ? getMainPosts() : getFollowingPosts();
      }
    },
    [panelName, getMainPosts, getFollowingPosts]
  );

  const handlePressCodeEnterButton = () => {
    codeEnteringBottomSheetModalRef.current?.present();
  };

  const viewabilityConfig = useMemo(
    () => ({
      waitForInteraction: false,
      minimumViewTime: 0,
      viewAreaCoveragePercentThreshold: 0,
    }),
    []
  );

  const onViewableItemsChanged = ({
    viewableItems,
    changed,
  }: {
    viewableItems: ViewToken[];
    changed: ViewToken[];
  }) => {
    setViewablePostDocPaths(viewableItems.map((item) => item.key));
  };

  const listData = useMemo(
    () =>
      Array.from(
        new Set(panelName === "all" ? mainPostDocPaths : followingPostDocPaths)
      ),
    [panelName, mainPostDocPaths, followingPostDocPaths]
  );

  const deletePostDocPathFromArray = (postDocPath: string) => {
    deletePostFromMainFeed(postDocPath);
  };

  const renderItem = useCallback(
    ({ item, index }: any) => {
      if (isIOS) {
        return (
          <Post
            postDocPath={item}
            key={item}
            deletePostDocPathFromArray={deletePostDocPathFromArray}
          />
        );
      }

      // For Android, calculate visibility without hooks
      const isThisPostViewable = (() => {
        if (!viewablePostDocPaths.length) return false;
        const viewableIndex = listData.findIndex(
          (q) => q === viewablePostDocPaths[0]
        );
        return Math.abs(index - viewableIndex) <= 5;
      })();

      return (
        <Post
          postDocPath={item}
          deletePostDocPathFromArray={deletePostDocPathFromArray}
          isThisPostViewable={isThisPostViewable}
        />
      );
    },
    [isIOS, viewablePostDocPaths, listData, deletePostDocPathFromArray]
  );

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

          {listData.length === 0 ? (
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
                ListFooterComponent={
                  <View
                    style={{
                      display:
                        (panelName === "all" && isGettingMainPosts) ||
                        (panelName === "following" && isGettingFollowingPosts)
                          ? "flex"
                          : "none",
                      width: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                      height: 50,
                    }}
                  >
                    <ActivityIndicator color="gray" size={32} />
                  </View>
                }
              />
            </>
          )}
        </ScrollView>
      ) : (
        <>
          {listData.length === 0 ? (
            <FlatList
              key="android-unvalid-flatlist"
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
            <FlatList
              key="android-valid-flatlist"
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
              viewabilityConfig={viewabilityConfig}
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
              ListFooterComponent={
                <View
                  style={{
                    display:
                      (panelName === "all" && isGettingMainPosts) ||
                      (panelName === "following" && isGettingFollowingPosts)
                        ? "flex"
                        : "none",
                    width: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 50,
                  }}
                >
                  <ActivityIndicator color="gray" size={32} />
                </View>
              }
            />
          )}
        </>
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
