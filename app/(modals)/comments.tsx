import { View, SafeAreaView, ActivityIndicator, FlatList } from "react-native";
import { Text } from "@/components/Text/Text";
import React, { useEffect, useState } from "react";
import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import { CommentServerData, PostServerData } from "@/types/Post";
import { useAtomValue } from "jotai";
import { firestore } from "@/firebase/client";
import { doc, onSnapshot } from "firebase/firestore";
import CommentItem from "@/components/Post/CommentItem";

const comments = () => {
  const screenParameters = useAtomValue(screenParametersAtom);

  const postDocPath = screenParameters.find(
    (query) => query.queryId === "postDocPath"
  )?.value as string;

  const [loading, setLoading] = useState(false);
  const [commentData, setCommentData] = useState<CommentServerData[]>([]);

  // Dynamic Data Fetching
  useEffect(() => {
    if (!postDocPath) return;

    if (loading) return;
    setLoading(true);

    const postDocRef = doc(firestore, postDocPath);
    const unsubscribe = onSnapshot(
      postDocRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          console.log("Post's realtime data can not be fecthed.");
          return setLoading(false);
        }
        const postDocData = snapshot.data() as PostServerData;
        setCommentData(postDocData.comments);

        return setLoading(false);
      },
      (error) => {
        console.error("Error on getting realtime data: ", error);
        return setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [postDocPath]);

  if (!postDocPath) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text>Internal Server Error</Text>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color="white" />
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
        data={commentData}
        renderItem={({ item }) => (
          <CommentItem
            message={item.message}
            sender={item.sender}
            ts={item.ts}
            key={`${item.sender}-${item.message}-${item.ts}`}
          />
        )}
      />
    </SafeAreaView>
  );
};

export default comments;
