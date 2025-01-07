import Post from "@/components/Post/Post";
import Text from "@/components/Text/Text";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { FlatList, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const post = () => {
  const { bottom } = useSafeAreaInsets();

  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  if (!id)
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

  const postDocPath = `posts/${id}`;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: (bottom || 20) + 60,
      }}
    >
      <FlatList
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        data={[postDocPath]}
        renderItem={({ item }) => <Post postDocPath={item} />}
        keyExtractor={(item) => item}
      />
    </ScrollView>
  );
};

export default post;
