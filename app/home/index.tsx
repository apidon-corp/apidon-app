import Post from "@/components/Post/Post";
import { auth } from "@/firebase/client";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView
} from "react-native";

const index = () => {
  const [loading, setLoading] = useState(false);
  const [postDocPathArray, setPostDocPathArray] = useState<string[]>([]);

  /**
   * Fetches paths of recommended posts from server.
   * @returns
   */
  const handleGetPostRecommendations = async () => {
    const currentUserAuthObject = auth.currentUser;
    if (!currentUserAuthObject) return false;

    const userPanelBaseUrl = process.env.EXPO_PUBLIC_USER_PANEL_ROOT_URL;
    if (!userPanelBaseUrl) {
      console.error("User panel base url couldnt fetch from .env file");
      return false;
    }

    if (loading) return false;

    setLoading(true);

    try {
      const idToken = await currentUserAuthObject.getIdToken();
      const route = `${userPanelBaseUrl}/api/feed/main/getPersonalizedMainFeed`;

      const response = await fetch(route, {
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

      setLoading(false);
      return setPostDocPathArray(postDocPathArrayFetched);
    } catch (error) {
      console.error("Error while fetching getPersonalizedMainFeed: ", error);
      setLoading(false);
      return setPostDocPathArray([]);
    }
  };

  useEffect(() => {
    handleGetPostRecommendations();
  }, []);

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
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <FlatList
        style={{
          width: "100%",
        }}
        contentContainerStyle={{
          gap: 20,
        }}
        data={postDocPathArray}
        renderItem={({ item }) => <Post postDocPath={item} key={item} />}
      />
    </SafeAreaView>
  );
};

export default index;
