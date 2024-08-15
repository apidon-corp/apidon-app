import Post from "@/components/Post/Post";
import Text from "@/components/Text/Text";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { FlatList, View } from "react-native";

const post = () => {
  const { sender, id } = useLocalSearchParams<{
    sender: string;
    id: string;
  }>();

  if (!sender || !id)
    return (
      <View
        style={{
          width: "100%",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Sender or identifier is missing.</Text>
      </View>
    );

  const postDocPath = `users/${sender}/posts/${id}`;

  return (
    <FlatList
      data={[postDocPath]}
      renderItem={({ item }) => <Post postDocPath={item} />}
      keyExtractor={(item) => item}
    />
  );
};

export default post;
