import NftMarketPreviewItem from "@/components/Nft/NftMarketPreviewItem";
import { useAuth } from "@/providers/AuthProvider";
import { NftDocDataInServer } from "@/types/Nft";
import firestore from "@react-native-firebase/firestore";
import React, { useEffect, useState } from "react";
import { FlatList, SafeAreaView } from "react-native";

const index = () => {
  const {authStatus} = useAuth();

  const [listedNftDocDatas, setListedNftDocDatas] = useState<
    NftDocDataInServer[]
  >([]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;

    setListedNftDocDatas([]);

    const unsubscribe = firestore()
      .collection("nfts")
      .orderBy("mintTime", "desc")
      .onSnapshot(
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            const nftDocData = change.doc.data() as NftDocDataInServer;

            if (change.type === "added") {
              if (nftDocData.listStatus.isListed) {
                setListedNftDocDatas((prev) => [nftDocData, ...prev]);
              }
            } else if (change.type === "modified") {
              if (nftDocData.listStatus.isListed) {
                setListedNftDocDatas((prev) => {
                  const updatedNftDocDatas = prev.map((n) => {
                    return n.tokenId === nftDocData.tokenId ? nftDocData : n;
                  });

                  if (
                    !updatedNftDocDatas.some(
                      (n) => n.tokenId === nftDocData.tokenId
                    )
                  )
                    return [nftDocData, ...prev];

                  return updatedNftDocDatas;
                });
              }
            }
          });
        },
        (error) => {
          console.error(
            "Error on getting realtime nft collection data: ",
            error
          );
          return setListedNftDocDatas([]);
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
        data={listedNftDocDatas}
        renderItem={({ item }) => (
          <NftMarketPreviewItem
            postDocPath={item.postDocPath}
            nftDocData={item}
            key={item.tokenId}
          />
        )}
        keyExtractor={(item) => item.tokenId.toString()}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default index;
