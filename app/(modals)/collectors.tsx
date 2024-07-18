import { ActivityIndicator, SafeAreaView, View } from "react-native";
import { Text } from "@/components/Text/Text";
import React, { useEffect, useState } from "react";
import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import { useAtomValue } from "jotai";
import { NftDocDataInServer } from "@/types/Nft";
import { PostServerData } from "@/types/Post";

import firestore from "@react-native-firebase/firestore";
import { FlatList } from "react-native-gesture-handler";
import UserCard from "@/components/User/UserCard";

const collectors = () => {
  const screenParameters = useAtomValue(screenParametersAtom);

  const postDocPath = screenParameters.find(
    (q) => q.queryId === "postDocPath"
  )?.value;

  const [postData, setPostData] = useState<PostServerData | null>(null);
  const [nftData, setNftData] = useState<NftDocDataInServer | null>(null);

  useEffect(() => {
    getInitialData();
  }, [postDocPath]);

  const getInitialData = async () => {
    if (!postDocPath) return;

    const postDataFetched = await getPostData(postDocPath);
    if (!postDataFetched) return setPostData(null);

    setPostData(postDataFetched);

    if (
      !postDataFetched.nftStatus.convertedToNft ||
      !postDataFetched.nftStatus.nftDocPath
    )
      return console.error("Post not converted to NFT yet.");

    const nftDocDataFetched = await getNftData(
      postDataFetched.nftStatus.nftDocPath
    );
    if (!nftDocDataFetched) return setNftData(null);
    setNftData(nftDocDataFetched);
  };

  const getPostData = async (postDocPath: string) => {
    try {
      const postDataSnapshot = await firestore().doc(postDocPath).get();
      if (!postDataSnapshot.exists) {
        console.error("Post's realtime data can not be fecthed.");
        return false;
      }

      const postDataFetched = postDataSnapshot.data() as PostServerData;

      return postDataFetched;
    } catch (error) {
      console.error("Error on getting inital data of post ", error);
      return false;
    }
  };

  const getNftData = async (nftDocPath: string) => {
    try {
      const nftDocSnapshot = await firestore().doc(nftDocPath).get();
      if (!nftDocSnapshot.exists) {
        console.error("NFT's realtime data can not be fecthed.");
        return false;
      }

      const nftDataFetched = nftDocSnapshot.data() as NftDocDataInServer;
      return nftDataFetched;
    } catch (error) {
      console.error("Error on getting inital data of NFT ", error);
      return false;
    }
  };

  if (!postDocPath) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Post doc path not found</Text>
      </View>
    );
  }

  if (!postData || !nftData) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="white" />
      </View>
    );
  }

  if (!nftData.listStatus.isListed) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>This NFT is not listed yet.</Text>
      </View>
    );
  }

  if (!nftData.listStatus.buyers || nftData.listStatus.buyers.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No one collected this NFT yet.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <FlatList
        contentContainerStyle={{
          gap: 5,
        }}
        data={nftData.listStatus.buyers}
        renderItem={({ item }) => (
          <UserCard username={item.username} key={item.username} />
        )}
        keyExtractor={(item) => item.username}
      />
    </SafeAreaView>
  );
};

export default collectors;
