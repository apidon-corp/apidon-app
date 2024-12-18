import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { useEffect, useRef, useState } from "react";

import firestore from "@react-native-firebase/firestore";
import { PostDataOnMainPostsCollection } from "@/types/Post";

type FirestoreDocType =
  FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>;

const POSTS_QUERY_LIMIT = 5;

export function useMainPosts() {
  const isGettingPostDocs = useRef(false);
  const isGettingMainPosts = useRef(false);

  const [postDocs, setPostDocs] = useState<FirestoreDocType[]>([]);

  const [postDocPaths, setPostDocPaths] = useState<string[]>([]);

  useEffect(() => {
    setPostDocPaths(
      postDocs.map(
        (doc) => (doc.data() as PostDataOnMainPostsCollection).postDocPath
      )
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

    let lastDoc: FirestoreDocType | undefined = undefined;

    if (postDocs.length > 0) lastDoc = postDocs[postDocs.length - 1];

    const newPostDocs = await getPostDocs(lastDoc);
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
    const newPostDocs = await getPostDocs(undefined);
    if (!newPostDocs) {
      console.error("Error on fetching new posts to refresh. See other logs.");
      return false;
    }

    setPostDocs(newPostDocs);
  }

  function addUploadedPostToFeed(postDocPath: string) {
    setPostDocPaths((prev) => [postDocPath, ...prev]);
  }

  function deletePostFromMainFeed(postDocPath: string) {
    setPostDocs((prev) =>
      prev.filter(
        (doc) =>
          (doc.data() as PostDataOnMainPostsCollection).postDocPath !==
          postDocPath
      )
    );
  }

  return {
    postDocPaths,
    getMainPosts,
    isGettingMainPosts: isGettingMainPosts.current,
    addUploadedPostToFeed,
    refreshMainPosts,
  };
}
