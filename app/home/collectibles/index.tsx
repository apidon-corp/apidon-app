import CollectibleOnMarketPreviewItem from "@/components/Collectible/CollectibleOnMarketPreviewItem";
import { View } from "@/components/Themed";
import { CollectibleDocData } from "@/types/Collectible";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  NativeScrollEvent,
  Pressable,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const index = () => {
  const { bottom } = useSafeAreaInsets();

  const [collectibleDocs, setCollectibleDocs] = useState<
    FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>[]
  >([]);

  const scrollViewRef = useRef<ScrollView>(null);

  const [refreshLoading, setRefreshLoading] = useState(false);

  const [displayPrefrence, setDisplayPreference] = useState<
    "grid" | "portrait"
  >("grid");

  useEffect(() => {
    handleGetInitialCollectibles();
  }, []);

  const handleGetInitialCollectibles = async () => {
    try {
      const query = await firestore()
        .collection("collectibles")
        .orderBy("timestamp", "desc")
        .limit(12)
        .get();

      setCollectibleDocs(query.docs);
    } catch (error) {
      console.error("Error on getting initial collectibles: ", error);
      setCollectibleDocs([]);
    }
  };

  const serveMoreCollectibles = async () => {
    try {
      const lastDoc = collectibleDocs[collectibleDocs.length - 1];

      if (!lastDoc) return;

      const query = await firestore()
        .collection("collectibles")
        .orderBy("timestamp", "desc")
        .startAfter(lastDoc)
        .limit(12)
        .get();

      setCollectibleDocs([...collectibleDocs, ...query.docs]);
    } catch (error) {
      console.error("Error on serving more collectibles: ", error);
    }
  };

  const handleScroll = (event: NativeScrollEvent) => {
    const threshold = 200;

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

  const handleDisplayPreferenceChange = (pref: "grid" | "portrait") => {
    setDisplayPreference(pref);
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
      contentContainerStyle={{
        paddingHorizontal: 15,
        paddingBottom: (bottom || 20) + 60,
      }}
    >
      <View
        id="display-preference"
        style={{
          width: "100%",
          marginVertical: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.25)",
            flexDirection: "row",
            justifyContent: "space-between",
            borderRadius: 20,
          }}
        >
          <Pressable
            onPress={() => handleDisplayPreferenceChange("grid")}
            style={{
              backgroundColor:
                displayPrefrence === "grid"
                  ? "rgba(255,255,255,0.25)"
                  : undefined,
              borderRadius: 20,
              paddingVertical: 3,
              paddingHorizontal: 15,
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons
              name="view-grid-outline"
              size={24}
              color="white"
            />
          </Pressable>

          <Pressable
            onPress={() => handleDisplayPreferenceChange("portrait")}
            style={{
              backgroundColor:
                displayPrefrence === "portrait"
                  ? "rgba(255,255,255,0.25)"
                  : undefined,

              borderRadius: 20,
              paddingVertical: 3,
              paddingHorizontal: 15,
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons
              name="crop-portrait"
              size={24}
              color="white"
            />
          </Pressable>
        </View>
      </View>

      <FlatList
        columnWrapperStyle={{
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
        scrollEnabled={false}
        data={Array.from(new Set(collectibleDocs)).map(
          (doc) => doc.data() as CollectibleDocData
        )}
        numColumns={2}
        renderItem={({ item }) => (
          <CollectibleOnMarketPreviewItem
            postDocPath={item.postDocPath}
            collectibleDocData={item}
            key={item.id}
            isGrid={displayPrefrence === "grid" ? true : false}
          />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </ScrollView>
  );
};

export default index;
