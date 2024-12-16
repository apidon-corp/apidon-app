import { useState, useRef } from "react";

import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { PostDataOnMainPostsCollection } from "@/types/Post";

const initialFollowingCount = 30;
const moreFollowingCount = 30;

const initialPostCount = 8;
const morePostCount = 8;

export function useFollowingPosts() {
  const [followingDocs, setFollowingDocs] = useState<
    FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>[]
  >([]);
  const [followingList, setFollowingList] = useState<string[]>([]);
  const [followingPostDocs, setFollowingPostDocs] = useState<
    FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>[]
  >([]);
  const [followingPostDocPaths, setFollowingPostDocPaths] = useState<string[]>(
    []
  );

  // Add refs to track loading states and prevent race conditions
  const isLoadingMore = useRef(false);
  const isUpdatingList = useRef(false);
  const hasMoreFollowings = useRef(true);

  async function getInitialFollowingPosts() {
    const displayName = auth().currentUser?.displayName || "";
    if (!displayName) {
      setFollowingDocs([]);
      setFollowingList([]);
      return;
    }

    let initialFollowingList = [];
    try {
      const query = await firestore()
        .collection("users")
        .doc(displayName)
        .collection("followings")
        .limit(initialFollowingCount)
        .get();

      // Reset the hasMore flag when starting fresh
      hasMoreFollowings.current = query.size > 0;

      setFollowingDocs(query.docs);
      setFollowingList(query.docs.map((d) => d.id));
      initialFollowingList = query.docs.map((d) => d.id);
    } catch (error) {
      console.error("Error while fetching getInitialFollowingList: ", error);
      return;
    }

    if (initialFollowingList.length === 0) return;

    try {
      const query = await firestore()
        .collection("posts")
        .orderBy("timestamp", "desc")
        .where("sender", "in", initialFollowingList)
        .limit(initialPostCount)
        .get();

      setFollowingPostDocs(query.docs);
      setFollowingPostDocPaths(
        query.docs.map(
          (d) => (d.data() as PostDataOnMainPostsCollection).postDocPath
        )
      );
    } catch (error) {
      console.error("Error while fetching getInitialFollowingPosts: ", error);
    }
  }

  async function getMoreFollowingPosts() {
    if (isLoadingMore.current || isUpdatingList.current) return;

    if (followingList.length === 0) return;

    const lastDoc = followingPostDocs[followingPostDocs.length - 1];
    if (!lastDoc) return;

    isLoadingMore.current = true;

    try {
      const query = await firestore()
        .collection("posts")
        .orderBy("timestamp", "desc")
        .where("sender", "in", followingList)
        .startAfter(lastDoc)
        .limit(morePostCount)
        .get();

      setFollowingPostDocs((prev) => [...prev, ...query.docs]);
      setFollowingPostDocPaths((prev) => [
        ...prev,
        ...query.docs.map(
          (d) => (d.data() as PostDataOnMainPostsCollection).postDocPath
        ),
      ]);

      // Only update following list if no more posts AND we have more followings to fetch
      if (query.size === 0 && hasMoreFollowings.current) {
        await updateFollowingList();
      }
    } catch (error) {
      console.error("Error while fetching getMoreFollowingPosts: ", error);
    } finally {
      isLoadingMore.current = false;
    }
  }

  async function updateFollowingList() {
    if (isUpdatingList.current) return;

    const displayName = auth().currentUser?.displayName || "";
    if (!displayName) return;

    const lastDoc = followingDocs[followingDocs.length - 1];
    if (!lastDoc) return;

    isUpdatingList.current = true;

    try {
      const query = await firestore()
        .collection("users")
        .doc(displayName)
        .collection("followings")
        .startAfter(lastDoc)
        .limit(moreFollowingCount)
        .get();

      // Update hasMore flag based on query results
      hasMoreFollowings.current = query.size > 0;

      if (query.size === 0) {
        isUpdatingList.current = false;
        return;
      }

      const updatedFollowings = query.docs.map((d) => d.id);

      setFollowingDocs(query.docs);
      setFollowingList(updatedFollowings);

      const postsQuery = await firestore()
        .collection("posts")
        .orderBy("timestamp", "desc")
        .where("sender", "in", updatedFollowings)
        .limit(morePostCount)
        .get();

      setFollowingPostDocs(postsQuery.docs);
      setFollowingPostDocPaths((prev) => [
        ...prev,
        ...postsQuery.docs.map(
          (d) => (d.data() as PostDataOnMainPostsCollection).postDocPath
        ),
      ]);
    } catch (error) {
      console.error("Error while updating following list: ", error);
    } finally {
      isUpdatingList.current = false;
    }
  }

  return {
    followingPostDocPaths,
    getInitialFollowingPosts,
    getMoreFollowingPosts,
  };
}
