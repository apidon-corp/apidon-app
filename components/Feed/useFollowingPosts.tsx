import { useState, useRef, useCallback } from "react";
import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { PostDataOnMainPostsCollection } from "@/types/Post";

const INITIAL_FOLLOWING_COUNT = 1;
const MORE_FOLLOWING_COUNT = 1;
const INITIAL_POST_COUNT = 8;
const MORE_POST_COUNT = 8;
const MAX_BATCH_RETRIES = 3;

export function useFollowingPosts() {
  const [followingDocs, setFollowingDocs] = useState<
    FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>[]
  >([]);
  const [followingList, setFollowingList] = useState<string[]>([]);
  const [followingPostDocs, setFollowingPostDocs] = useState<
    FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>[]
  >([]);
  const [followingPostDocPaths, setFollowingPostDocPaths] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoadingMore = useRef(false);
  const isUpdatingList = useRef(false);
  const hasMoreFollowings = useRef(true);
  const currentRetryCount = useRef(0);

  const getCurrentUser = useCallback(() => {
    const displayName = auth().currentUser?.displayName;
    if (!displayName) {
      throw new Error("No authenticated user found");
    }
    return displayName;
  }, []);

  const fetchFollowingBatch = useCallback(async (
    startAfterDoc?: FirebaseFirestoreTypes.QueryDocumentSnapshot,
    batchSize: number = INITIAL_FOLLOWING_COUNT
  ) => {
    const displayName = getCurrentUser();
    let query = firestore()
      .collection("users")
      .doc(displayName)
      .collection("followings")
      .limit(batchSize);

    if (startAfterDoc) {
      query = query.startAfter(startAfterDoc);
    }

    const snapshot = await query.get();
    hasMoreFollowings.current = snapshot.size === batchSize;
    return snapshot.docs;
  }, []);

  const fetchPostsBatch = useCallback(async (
    userList: string[],
    startAfterDoc?: FirebaseFirestoreTypes.QueryDocumentSnapshot,
    batchSize: number = INITIAL_POST_COUNT
  ): Promise<FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>> => {
    if (userList.length === 0) {
      return firestore().collection('posts').limit(0).get(); // Return empty query result
    }

    let query = firestore()
      .collection("posts")
      .orderBy("timestamp", "desc")
      .where("sender", "in", userList)
      .limit(batchSize);

    if (startAfterDoc) {
      query = query.startAfter(startAfterDoc);
    }

    return query.get();
  }, []);

  const getInitialFollowingPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    currentRetryCount.current = 0;

    try {
      // Fetch initial following list
      const followingDocs = await fetchFollowingBatch();
      const followingIds = followingDocs.map(doc => doc.id);
      
      setFollowingDocs(followingDocs);
      setFollowingList(followingIds);

      if (followingIds.length === 0) {
        setIsLoading(false);
        return;
      }

      // Try to fetch posts with exponential backoff on empty results
      let postsSnapshot = await fetchPostsBatch(followingIds);
      
      while (postsSnapshot.docs.length === 0 && 
             hasMoreFollowings.current && 
             currentRetryCount.current < MAX_BATCH_RETRIES) {
        
        currentRetryCount.current++;
        
        // Fetch next batch of followings
        const nextFollowingDocs = await fetchFollowingBatch(
          followingDocs[followingDocs.length - 1],
          MORE_FOLLOWING_COUNT
        );
        
        const nextFollowingIds = nextFollowingDocs.map(doc => doc.id);
        setFollowingDocs(prev => [...prev, ...nextFollowingDocs]);
        setFollowingList(prev => [...prev, ...nextFollowingIds]);
        
        // Try to fetch posts from the expanded following list
        postsSnapshot = await fetchPostsBatch([...followingIds, ...nextFollowingIds]);
      }

      setFollowingPostDocs(postsSnapshot.docs);
      setFollowingPostDocPaths(
        postsSnapshot.docs.map(
          (d) => (d.data() as PostDataOnMainPostsCollection).postDocPath
        )
      );
    } catch (error) {
      console.error("Error in getInitialFollowingPosts:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [fetchFollowingBatch, fetchPostsBatch]);

  const getMoreFollowingPosts = useCallback(async () => {
    if (isLoadingMore.current || isUpdatingList.current || !followingList.length) {
      return;
    }

    const lastDoc = followingPostDocs[followingPostDocs.length - 1];
    if (!lastDoc) return;

    isLoadingMore.current = true;
    currentRetryCount.current = 0;

    try {
      let postsSnapshot = await fetchPostsBatch(
        followingList,
        lastDoc,
        MORE_POST_COUNT
      );

      while (postsSnapshot.docs.length === 0 && 
             hasMoreFollowings.current && 
             currentRetryCount.current < MAX_BATCH_RETRIES) {
        
        currentRetryCount.current++;
        await updateFollowingList();
        
        if (followingList.length > 0) {
          postsSnapshot = await fetchPostsBatch(followingList, undefined, MORE_POST_COUNT);
        }
      }

      if (postsSnapshot.docs.length > 0) {
        setFollowingPostDocs(prev => [...prev, ...postsSnapshot.docs]);
        setFollowingPostDocPaths(prev => [
          ...prev,
          ...postsSnapshot.docs.map(
            (d) => (d.data() as PostDataOnMainPostsCollection).postDocPath
          ),
        ]);
      }
    } catch (error) {
      console.error("Error in getMoreFollowingPosts:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      isLoadingMore.current = false;
    }
  }, [fetchPostsBatch, followingList, followingPostDocs]);

  const updateFollowingList = useCallback(async () => {
    if (isUpdatingList.current || !hasMoreFollowings.current) return;

    const lastDoc = followingDocs[followingDocs.length - 1];
    if (!lastDoc) return;

    isUpdatingList.current = true;

    try {
      const newFollowingDocs = await fetchFollowingBatch(lastDoc, MORE_FOLLOWING_COUNT);
      
      if (newFollowingDocs.length > 0) {
        const newFollowingIds = newFollowingDocs.map(doc => doc.id);
        setFollowingDocs(prev => [...prev, ...newFollowingDocs]);
        setFollowingList(prev => [...prev, ...newFollowingIds]);
      }
    } catch (error) {
      console.error("Error in updateFollowingList:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      isUpdatingList.current = false;
    }
  }, [fetchFollowingBatch, followingDocs]);

  return {
    followingPostDocPaths,
    getInitialFollowingPosts,
    getMoreFollowingPosts,
    isLoading,
    error,
    hasMore: hasMoreFollowings.current || followingPostDocs.length > 0,
  };
}