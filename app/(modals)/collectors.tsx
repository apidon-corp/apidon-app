import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import { Text } from "@/components/Text/Text";
import { PostServerData } from "@/types/Post";
import { useAtomValue } from "jotai";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, View } from "react-native";

import UserCard from "@/components/User/UserCard";
import { CollectibleDocData, CollectorDocData } from "@/types/Collectible";
import firestore from "@react-native-firebase/firestore";
import { FlatList } from "react-native-gesture-handler";

const collectors = () => {
  const screenParameters = useAtomValue(screenParametersAtom);

  const postDocPath = screenParameters.find(
    (q) => q.queryId === "postDocPath"
  )?.value;

  const [postData, setPostData] = useState<PostServerData | null>(null);
  const [collectibleData, setCollectibleData] =
    useState<CollectibleDocData | null>(null);

  const [collectorDocDatas, setCollectorDocDatas] = useState<
    CollectorDocData[] | null
  >(null);

  useEffect(() => {
    getInitialData();
  }, [postDocPath]);

  useEffect(() => {
    if (!collectibleData) return;

    const unsubscribe = firestore()
      .collection(`collectibles/${collectibleData.id}/collectors`)
      .onSnapshot(
        (snapshot) => {
          const collectorDocDatasFetched = snapshot.docs.map(
            (doc) => doc.data() as CollectorDocData
          );
          setCollectorDocDatas(collectorDocDatasFetched);
        },

        (error) => {
          console.error("Error on getting realtime collectors ", error);
          return setCollectorDocDatas(null);
        }
      );
    return () => unsubscribe();
  }, [collectibleData]);

  const getInitialData = async () => {
    if (!postDocPath) return;

    const postDataFetched = await getPostData(postDocPath);
    if (!postDataFetched) return setPostData(null);

    setPostData(postDataFetched);

    if (!postDataFetched.collectibleStatus.isCollectible)
      return console.error("Post not converted to collectible yet.");

    const collectibleDocDataFetched = await getCollectibleData(
      postDataFetched.collectibleStatus.collectibleDocPath
    );
    if (!collectibleDocDataFetched) return setCollectibleData(null);
    setCollectibleData(collectibleDocDataFetched);
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

  const getCollectibleData = async (collectibleDocPath: string) => {
    try {
      const collectibleDocSnapshot = await firestore()
        .doc(collectibleDocPath)
        .get();
      if (!collectibleDocSnapshot.exists) {
        console.error("Collectible's realtime data can not be fecthed.");
        return false;
      }

      const collectibleDataFetched =
        collectibleDocSnapshot.data() as CollectibleDocData;
      return collectibleDataFetched;
    } catch (error) {
      console.error("Error on getting inital data of collectible ", error);
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

  if (!postData || !collectibleData || !collectorDocDatas) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="white" />
      </View>
    );
  }

  if (collectorDocDatas.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No one collected this collectible yet.</Text>
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
          paddingHorizontal: 10,
        }}
        data={collectorDocDatas}
        renderItem={({ item }) => (
          <UserCard username={item.username} key={item.username} />
        )}
        keyExtractor={(item) => item.username}
      />
    </SafeAreaView>
  );
};

export default collectors;
