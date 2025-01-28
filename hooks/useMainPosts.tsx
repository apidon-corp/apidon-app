import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { useEffect, useRef, useState } from "react";

import firestore from "@react-native-firebase/firestore";
import { PostServerData } from "@/types/Post";

type FirestoreDocType =
  FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>;

const POSTS_QUERY_LIMIT = 5;

export function useMainPosts() {
  const isGettingPostDocs = useRef(false);
  const isGettingMainPosts = useRef(false);
  const lastDocRef = useRef<FirestoreDocType | undefined>(undefined);

  const [postDocs, setPostDocs] = useState<FirestoreDocType[]>([]);

  const [mainPostDocPaths, setMainPostDocPaths] = useState<string[]>([]);

  useEffect(() => {
    setMainPostDocPaths(
      postDocs.map((doc) => (doc.data() as PostServerData).postDocPath)
    );
  }, [postDocs]);

  async function getPostDocs(startAfterDoc?: FirestoreDocType) {
    if (isGettingPostDocs.current) return false;
    isGettingPostDocs.current = true;

    try {
      let postsQuery = firestore()
        .collection("posts")
        .orderBy("timestamp", "desc")
        .limit(POSTS_QUERY_LIMIT);

      if (startAfterDoc) postsQuery = postsQuery.startAfter(startAfterDoc);

      const snapshot = await postsQuery.get();

      isGettingPostDocs.current = false;
      lastDocRef.current =
        snapshot.docs.length > 0
          ? snapshot.docs[snapshot.docs.length - 1]
          : undefined;

      return snapshot.docs;
    } catch (error) {
      console.error("Error fetching posts:", error);

      // Ref Updates
      isGettingPostDocs.current = false;

      return false;
    }
  }

  async function getMainPosts() {
    if (isGettingMainPosts.current) return false;
    isGettingMainPosts.current = true;

    const newPostDocs = await getPostDocs(lastDocRef.current);
    if (!newPostDocs) {
      console.error("Error on fetching new posts. See other logs.");
      isGettingMainPosts.current = false;
      return false;
    }

    // State Update
    setPostDocs((prev) => [...prev, ...newPostDocs]);

    // Ref Update
    isGettingMainPosts.current = false;
  }

  async function refreshMainPosts() {
    lastDocRef.current = undefined;
    const newPostDocs = await getPostDocs(undefined);
    if (!newPostDocs) {
      console.error("Error on fetching new posts to refresh. See other logs.");
      return false;
    }

    setPostDocs(newPostDocs);
  }

  function addUploadedPostToFeed(postDocPath: string) {
    setMainPostDocPaths((prev) => [postDocPath, ...prev]);
  }

  function deletePostFromMainFeed(postDocPath: string) {
    setPostDocs((prev) =>
      prev.filter(
        (doc) => (doc.data() as PostServerData).postDocPath !== postDocPath
      )
    );
  }

  return {
    mainPostDocPaths,
    getMainPosts,
    isGettingMainPosts: isGettingMainPosts.current,
    addUploadedPostToFeed,
    refreshMainPosts,
    deletePostFromMainFeed,
  };
}
