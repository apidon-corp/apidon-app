import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import { Text } from "@/components/Text/Text";
import { useAtomValue } from "jotai";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, ScrollView, View } from "react-native";

import CodeItem from "@/components/code/CodeItem";
import { CodeDocData } from "@/types/Collectible";
import auth from "@react-native-firebase/auth";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import firestore from "@react-native-firebase/firestore";

const codes = () => {
  const screenParameters = useAtomValue(screenParametersAtom);
  const postDocPath = screenParameters.find((q) => q.queryId === "postDocPath")
    ?.value as string | undefined;

  const [codes, setCodes] = useState<CodeDocData[] | null>(null);

  const { bottom } = useSafeAreaInsets();

  useEffect(() => {
    if (!postDocPath) return setCodes(null);

    const displayName = auth().currentUser?.displayName;
    if (!displayName) return setCodes(null);

    const unsubscribe = firestore()
      .collection("collectibleCodes")
      .where("creatorUsername", "==", displayName)
      .where("postDocPath", "==", postDocPath)
      .onSnapshot(
        (snapshot) => {
          const codes = snapshot.docs.map((doc) => doc.data() as CodeDocData);
          setCodes(codes);
        },
        (error) => {
          console.error("Error on codes snapshot: ", error);
          setCodes(null);
        }
      );
    return () => unsubscribe();
  }, [postDocPath]);

  if (!postDocPath) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Post doc path not found</Text>
      </View>
    );
  }

  if (!codes) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (codes.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>No codes found</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: (bottom | 20) + 60,
        }}
        showsVerticalScrollIndicator={false}
      >
        <FlatList
          scrollEnabled={false}
          contentContainerStyle={{
            gap: 5,
            paddingHorizontal: 10,
          }}
          data={codes.sort((a, b) => Number(b) - Number(a))}
          renderItem={({ item }) => (
            <CodeItem code={item.code} isUsed={item.isConsumed} />
          )}
          keyExtractor={(item) => item.code}
        />
      </ScrollView>
    </>
  );
};

export default codes;
