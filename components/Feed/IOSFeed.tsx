import { useMainCollectedCollectibles } from "@/hooks/useMainCollectedCollectibles";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CollectibleItem from "../Collectible/CollectibleItem";
import Pagination from "./Pagination";
import { useMainPosts } from "@/hooks/useMainPosts";
import Post from "../Post/Post";
import { useAtom, useAtomValue } from "jotai";
import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import { useHeaderHeight } from "@react-navigation/elements";
import { homeScreeenParametersAtom } from "@/atoms/homeScreenAtom";

const IOSFeed = () => {
  const screenParameters = useAtomValue(screenParametersAtom);

  const createdPostDocPath = screenParameters.find(
    (q) => q.queryId === "createdPostDocPath"
  )?.value as string | undefined;

  const collectedDocPath = screenParameters.find(
    (q) => q.queryId === "collectedDocPath"
  )?.value as string | undefined;

  const [homeScreenParametersValue, setHomeScreenParameters] = useAtom(
    homeScreeenParametersAtom
  );

  const { bottom } = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [panelName, setPanelName] = useState<"colls" | "posts">("colls");

  const scrollViewRef = useRef<ScrollView>(null);

  const [refreshing, setRefreshing] = useState(false);

  const {
    docDatas,
    getMainDocs: getMainColls,
    refreshDocs: refreshMainColls,
    addNewlyCollectedItemToFeed,
  } = useMainCollectedCollectibles();

  const {
    mainPostDocPaths,
    getMainPosts,
    addUploadedPostToFeed,
    deletePostFromMainFeed,
    refreshMainPosts,
  } = useMainPosts();

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const threshold = 500;
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
      scrollViewRef.current?.scrollTo({ y: -headerHeight + 1 });
    }, 500);
  }, [createdPostDocPath]);

  // Handling Collected Collectible
  useEffect(() => {
    if (!collectedDocPath) return;

    setPanelName("colls");
    addNewlyCollectedItemToFeed(collectedDocPath);

    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: -headerHeight + 1 });
    }, 500);
  }, [collectedDocPath]);

  // Handling Pressing Main Menu Button
  useEffect(() => {
    if (homeScreenParametersValue.isHomeButtonPressed) {
      scrollViewRef.current?.scrollTo({ y: -headerHeight + 1 });

      setHomeScreenParameters({ isHomeButtonPressed: false });
    }
  }, [homeScreenParametersValue]);

  return (
    <ScrollView
      ref={scrollViewRef}
      contentInsetAdjustmentBehavior="automatic"
      style={{ width: "100%" }}
      contentContainerStyle={{
        paddingBottom: (bottom || 20) + 60,
        gap: 20,
      }}
      showsVerticalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={500}
      scrollToOverflowEnabled={true}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <Pagination panelName={panelName} setPanelName={setPanelName} />

      {panelName === "colls" && (
        <FlatList
          contentContainerStyle={{
            gap: 20,
          }}
          data={docDatas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CollectibleItem collectedCollectibleDocData={item} />
          )}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      )}

      {panelName === "posts" && (
        <FlatList
          contentContainerStyle={{
            gap: 20,
          }}
          data={mainPostDocPaths}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Post
              postDocPath={item}
              deletePostDocPathFromArray={deletePostFromMainFeed}
            />
          )}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      )}
    </ScrollView>
  );
};

export default IOSFeed;
