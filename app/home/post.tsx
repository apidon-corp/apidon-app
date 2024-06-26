import Post from "@/components/Post/Post";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native";

const post = () => {
  const { sender, id } = useLocalSearchParams<{
    sender: string;
    id: string;
  }>();

  if (!sender || !id) return <></>;

  const postDocPath = `users/${sender}/posts/${id}`;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Post postDocPath={postDocPath} />
    </SafeAreaView>
  );
};

export default post;
