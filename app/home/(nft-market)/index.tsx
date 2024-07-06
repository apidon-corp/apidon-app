import NftPreview from "@/components/Nft/NftPreview";
import { firestore } from "@/firebase/client";
import { useAuth } from "@/providers/AuthProvider";
import { NftDocDataInServer } from "@/types/Nft";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FlatList, SafeAreaView } from "react-native";

const index = () => {
  const authStatus = useAuth();

  const [nftConvertedPostDocPaths, setNftConvertedPostDocPaths] = useState<
    string[]
  >([]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;

    const nftCollectionRef = collection(firestore, "/nfts");
    const nftQuery = query(nftCollectionRef, orderBy("mintTime", "desc"));

    setNftConvertedPostDocPaths([]);

    const unsubscribe = onSnapshot(
      nftQuery,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const nftDocData = change.doc.data() as NftDocDataInServer;

            setNftConvertedPostDocPaths((prev) => [
              nftDocData.postDocPath,
              ...prev,
            ]);
          }
        });
      },
      (error) => {
        console.error("Error on getting realtime nft collection data: ", error);
        return setNftConvertedPostDocPaths([]);
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
        data={nftConvertedPostDocPaths}
        renderItem={({ item }) => <NftPreview postDocPath={item} key={item} />}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default index;
