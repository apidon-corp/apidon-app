import { homeScreeenParametersAtom } from "@/atoms/homeScreenAtom";
import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import { useMainCollectedCollectibles } from "@/hooks/useMainCollectedCollectibles";
import { useMainPosts } from "@/hooks/useMainPosts";
import { useAtom, useAtomValue } from "jotai";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  View,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CollectibleItem from "../Collectible/CollectibleItem";
import Pagination from "./Pagination";
import Post from "../Post/Post";

type Props = {};

const AndroidFeed = (props: Props) => {
  const screenParameters = useAtomValue(screenParametersAtom);

  const createdPostDocPath = screenParameters.find(
    (q) => q.queryId === "createdPostDocPath"
  )?.value as string | undefined;

  const [homeScreenParametersValue, setHomeScreenParameters] = useAtom(
    homeScreeenParametersAtom
  );

  const collFlatListRef = useRef<FlatList>(null);
  const postsFlatListRef = useRef<FlatList>(null);

  const { bottom } = useSafeAreaInsets();

  const [panelName, setPanelName] = useState<"colls" | "posts">("colls");

  const [refreshing, setRefreshing] = useState(false);

  const {
    docDatas,
    getMainDocs: getMainColls,
    refreshDocs: refreshMainColls,
    isGettingMainDocs,
  } = useMainCollectedCollectibles();

  const {
    mainPostDocPaths,
    getMainPosts,
    addUploadedPostToFeed,
    deletePostFromMainFeed,
    refreshMainPosts,
    isGettingMainPosts,
  } = useMainPosts();

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const threshold = 1000;
      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent;

      const closedToBottom =
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - threshold;

      if (closedToBottom)
        panelName === "colls" ? getMainColls() : getMainPosts();
    },
    [panelName]
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    if (panelName === "colls") await refreshMainColls();
    else await refreshMainPosts();
    setRefreshing(false);
  };

  // Getting initial colls or posts based panel name.
  useEffect(() => {
    if (panelName === "colls") refreshMainColls();
    else getMainPosts();
  }, [panelName]);

  // Handling created post.
  useEffect(() => {
    if (!createdPostDocPath) return;

    setPanelName("posts");
    addUploadedPostToFeed(createdPostDocPath);

    setTimeout(() => {
      collFlatListRef.current?.scrollToIndex({ animated: true, index: 0 });
    }, 500);
  }, [createdPostDocPath]);

  // Handling Pressing Main Menu Button
  useEffect(() => {
    if (homeScreenParametersValue.isHomeButtonPressed) {
      if (panelName === "colls")
        collFlatListRef.current?.scrollToIndex({ animated: true, index: 0 });

      if (panelName === "posts")
        postsFlatListRef.current?.scrollToIndex({ animated: true, index: 0 });

      setHomeScreenParameters({ isHomeButtonPressed: false });
    }
  }, [homeScreenParametersValue]);

  const collRenderItem = useCallback(({ item }: any) => {
    return <CollectibleItem collectedCollectibleDocData={item} />;
  }, []);

  const postRenderItem = useCallback(
    ({ item }: any) => {
      return (
        <Post
          postDocPath={item}
          deletePostDocPathFromArray={deletePostFromMainFeed}
        />
      );
    },
    [mainPostDocPaths]
  );

  const collFlatlistFooterComponent = () => {
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {isGettingMainDocs && <ActivityIndicator size="large" color="white" />}
      </View>
    );
  };

  const postFlatlistFooterComponent = () => {
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {isGettingMainPosts && <ActivityIndicator size="large" color="white" />}
      </View>
    );
  };

  return (
    <>
      <Pagination
        panelName={panelName}
        setPanelName={setPanelName}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          marginVertical: 20,
          zIndex: 1,
        }}
      />

      {panelName === "colls" && (
        <FlatList
          ref={collFlatListRef}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{
            paddingTop: 65,
            paddingBottom: (bottom || 20) + 60,
            gap: 20,
          }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollToOverflowEnabled={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          data={docDatas}
          renderItem={collRenderItem}
          ListFooterComponent={collFlatlistFooterComponent}
        />
      )}

      {panelName === "posts" && (
        <FlatList
          ref={postsFlatListRef}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{
            paddingTop: 65,
            paddingBottom: (bottom || 20) + 60,
            gap: 20,
          }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollToOverflowEnabled={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          data={mainPostDocPaths}
          renderItem={postRenderItem}
          ListFooterComponent={postFlatlistFooterComponent}
        />
      )}
    </>
  );
};

export default AndroidFeed;
