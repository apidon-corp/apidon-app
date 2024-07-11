import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import Post from "@/components/Post/Post";
import apiRoutes from "@/helpers/ApiRoutes";
import { useAtomValue } from "jotai";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, SafeAreaView } from "react-native";

import auth from "@react-native-firebase/auth";

const index = () => {
  const [loading, setLoading] = useState(false);
  const [postDocPathArray, setPostDocPathArray] = useState<string[]>([]);

  const screenParameters = useAtomValue(screenParametersAtom);

  const createdPostDocPath = screenParameters.find(
    (q) => q.queryId === "createdPostDocPath"
  )?.value as string | undefined;

  useEffect(() => {
    if (!createdPostDocPath) return;

    const previousValues = postDocPathArray;
    if (previousValues.includes(createdPostDocPath)) return;

    previousValues.unshift(createdPostDocPath);

    const updatedValues = previousValues;

    setPostDocPathArray(updatedValues);
  }, [createdPostDocPath]);

  useEffect(() => {
    handleGetPostRecommendations();
  }, []);

  /**
   * Fetches paths of recommended posts from server.
   * @returns
   */
  const handleGetPostRecommendations = async () => {
    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return false;

    if (loading) return false;

    setLoading(true);

    try {
      const idToken = await currentUserAuthObject.getIdToken();

      const response = await fetch(apiRoutes.feed.getPersonalizedFeed, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const message = await response.text();
        console.error(
          "Response from getPersonalizedMainFeed API is not okay: ",
          message
        );
        setLoading(false);
        return setPostDocPathArray([]);
      }

      const result = await response.json();

      const postDocPathArrayFetched = result.postDocPathArray as string[];

      if (createdPostDocPath)
        postDocPathArrayFetched.unshift(createdPostDocPath);

      setLoading(false);

      // We are removing first "/" from post doc path because mr react native firebase firestore doesn't like it.
      const unSlicedAtFirstPostDocPathArrayFetched =
        postDocPathArrayFetched.map((p) => p.slice(1));

      return setPostDocPathArray(unSlicedAtFirstPostDocPathArrayFetched);
    } catch (error) {
      console.error("Error while fetching getPersonalizedMainFeed: ", error);
      setLoading(false);
      return setPostDocPathArray([]);
    }
  };

  if (loading)
    return (
      <SafeAreaView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator size="large" color="white" />
      </SafeAreaView>
    );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <FlatList
        style={{
          width: "100%",
        }}
        contentContainerStyle={{
          gap: 20,
        }}
        keyExtractor={(item) => item}
        data={postDocPathArray}
        renderItem={({ item }) => <Post postDocPath={item} key={item} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default index;
