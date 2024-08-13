import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import Text from "@/components/Text/Text";
import UserCard from "@/components/User/UserCard";
import { PostServerData, RateData } from "@/types/Post";
import firestore from "@react-native-firebase/firestore";
import { useAtomValue } from "jotai";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, SafeAreaView } from "react-native";

const Likes = () => {
  const screenParameters = useAtomValue(screenParametersAtom);

  const postDocPath = screenParameters.find(
    (query) => query.queryId === "postDocPath"
  )?.value as string;

  const [loading, setLoading] = useState(false);
  const [rateData, setRateData] = useState<RateData[]>([]);

  // Dynamic Data Fetching
  useEffect(() => {
    if (!postDocPath) return;

    if (loading) return;
    setLoading(true);

    const unsubscribe = firestore()
      .doc(postDocPath)
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) {
            console.log("Post's realtime data can not be fecthed.");
            return setLoading(false);
          }
          const postDocData = snapshot.data() as PostServerData;
          setRateData(postDocData.rates);

          return setLoading(false);
        },
        (error) => {
          console.error("Error on getting realtime data: ", error);
          return setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [postDocPath]);

  if (!postDocPath)
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Internal Server Error</Text>
      </SafeAreaView>
    );

  if (loading)
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color="white" size="large" />
      </SafeAreaView>
    );

  if (rateData.length === 0) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>No rates yet.</Text>
      </SafeAreaView>
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
        data={rateData}
        renderItem={({ item }) => (
          <UserCard username={item.sender} key={item.sender} />
        )}
      />
    </SafeAreaView>
  );
};

export default Likes;
