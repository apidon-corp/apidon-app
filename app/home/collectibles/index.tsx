import NftMarketPreviewItem from "@/components/Nft/NftMarketPreviewItem";
import { CollectibleDocData } from "@/types/Collectible";
import firestore from "@react-native-firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  NativeScrollEvent,
  RefreshControl,
  ScrollView,
} from "react-native";

const index = () => {
  const [collectibleDocDatas, setCollectibleDocDatas] = useState<
    CollectibleDocData[]
  >([]);
  const [servedCollectibles, setServedCollectibles] = useState<
    CollectibleDocData[]
  >([]);

  const scrollViewRef = useRef<ScrollView>(null);

  const [refreshLoading, setRefreshLoading] = useState(false);

  useEffect(() => {
    handleGetInitialCollectibles();
  }, []);

  const handleGetInitialCollectibles = async () => {
    console.log("Getting initial collectibles");

    try {
      const query = await firestore()
        .collection("collectibles")
        .orderBy("timestamp", "desc")
        .get();

      const collectibleDocDatasFetched: CollectibleDocData[] = [];

      for (const doc of query.docs) {
        collectibleDocDatasFetched.push(doc.data() as CollectibleDocData);
      }
      setCollectibleDocDatas(collectibleDocDatasFetched);
      setServedCollectibles(collectibleDocDatasFetched.slice(0, 8));
    } catch (error) {
      console.error("Error on getting initial collectibles: ", error);
    }
  };

  const serveMoreCollectibles = () => {
    if (servedCollectibles.length === collectibleDocDatas.length) {
      console.log("No more collectible to serve.");
      return;
    }

    setServedCollectibles((prev) => {
      return [
        ...prev,
        ...collectibleDocDatas.slice(prev.length, prev.length + 4),
      ];
    });
  };

  const handleScroll = (event: NativeScrollEvent) => {
    const threshold = 0;

    const { layoutMeasurement, contentOffset, contentSize } = event;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - threshold;
    if (isCloseToBottom) {
      serveMoreCollectibles();
    }
  };

  const handleRefresh = async () => {
    if (refreshLoading) return;

    setRefreshLoading(true);

    await handleGetInitialCollectibles();

    setRefreshLoading(false);
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      onScroll={({ nativeEvent }) => handleScroll(nativeEvent)}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl refreshing={refreshLoading} onRefresh={handleRefresh} />
      }
    >
      <FlatList
        scrollEnabled={false}
        style={{ width: "100%" }}
        numColumns={2}
        data={servedCollectibles.sort((a, b) => b.timestamp - a.timestamp)}
        renderItem={({ item }) => (
          <NftMarketPreviewItem
            postDocPath={item.postDocPath}
            collectibleDocData={item}
            key={item.id}
          />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </ScrollView>
  );
};

export default index;
