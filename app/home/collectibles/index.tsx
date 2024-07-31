import NftMarketPreviewItem from "@/components/Nft/NftMarketPreviewItem";
import { useAuth } from "@/providers/AuthProvider";
import { CollectibleDocData } from "@/types/Collectible";
import firestore from "@react-native-firebase/firestore";
import React, { useEffect, useState } from "react";
import { FlatList, SafeAreaView } from "react-native";

const index = () => {
  const { authStatus } = useAuth();

  const [collectibleDocDatas, setCollectibleDocDatas] = useState<
    CollectibleDocData[]
  >([]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;

    setCollectibleDocDatas([]);

    const unsubscribe = firestore()
      .collection("collectibles")
      .orderBy("timestamp", "desc")
      .onSnapshot(
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            const collectibleDocData = change.doc.data() as CollectibleDocData;

            if (change.type === "added") {
              setCollectibleDocDatas((prev) => [collectibleDocData, ...prev]);
            } else if (change.type === "modified") {
              setCollectibleDocDatas((prev) =>
                prev.map((item) =>
                  item.id === collectibleDocData.id ? collectibleDocData : item
                )
              );
            }
          });
        },
        (error) => {
          console.error(
            "Error on getting realtime collectibe collection data: ",
            error
          );
          return setCollectibleDocDatas([]);
        }
      );

    return () => unsubscribe();
  }, [authStatus]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
      }}
    >
      <FlatList
        style={{ width: "100%" }}
        numColumns={2}
        data={collectibleDocDatas}
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
    </SafeAreaView>
  );
};

export default index;
