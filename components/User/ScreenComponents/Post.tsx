import Post from "@/components/Post/Post";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { FlatList, SafeAreaView } from "react-native";

const post = () => {
  const { sender, id } = useLocalSearchParams<{
    sender: string;
    id: string;
  }>();

  if (!sender || !id) return <></>;

  const postDocPath = `users/${sender}/posts/${id}`;

  return (
    <FlatList
      data={[postDocPath]}
      renderItem={({ item }) => <Post postDocPath={item} />}
    />
  );
};

export default post;
