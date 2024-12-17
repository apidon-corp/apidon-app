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
  const [followingPostDocPaths, setFollowingPostDocPaths] = useState<string[]>(
    []
  );
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

  /**
   * Fetches a batch of "following" documents for the current user from Firestore.
   * This method retrieves a specific number of documents from the "followings" collection
   * under the current user's profile, starting after a specified document if provided.
   */
  const fetchFollowingBatch = useCallback(
    async (
      startAfterDoc?: FirebaseFirestoreTypes.QueryDocumentSnapshot,
      batchSize: number = INITIAL_FOLLOWING_COUNT
    ): Promise<FirebaseFirestoreTypes.QueryDocumentSnapshot[]> => {
      // Get the current user's display name
      const displayName = getCurrentUser();

      // Initialize a Firestore query to fetch the "followings" collection for the current user
      let query = firestore()
        .collection("users")
        .doc(displayName)
        .collection("followings")
        .limit(batchSize);

      // If a startAfterDoc is provided, modify the query to start after that document
      if (startAfterDoc) {
        query = query.startAfter(startAfterDoc);
      }

      // Execute the query and retrieve the snapshot
      const snapshot = await query.get();

      // Determine if there are more documents to load based on the batch size
      hasMoreFollowings.current = snapshot.size === batchSize;

      // Return the array of document snapshots
      return snapshot.docs;
    },
    []
  );

  /**
   * Fetches a batch of posts from the "posts" collection in Firestore.
   * The method retrieves posts sent by users specified in the `userList` array, ordered by timestamp in descending order.
   * Supports pagination through the `startAfterDoc` parameter and allows limiting the number of results.
   */
  const fetchPostsBatch = useCallback(
    async (
      userList: string[],
      startAfterDoc?: FirebaseFirestoreTypes.QueryDocumentSnapshot,
      batchSize: number = INITIAL_POST_COUNT
    ): Promise<
      FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>
    > => {
      // If the user list is empty, return an empty query result
      if (userList.length === 0) {
        return firestore().collection("posts").limit(0).get();
      }

      // Initialize a Firestore query on the "posts" collection
      // - Order posts by "timestamp" in descending order (most recent first)
      // - Filter posts where the "sender" field matches any ID in the userList array
      // - Limit the number of documents to batchSize
      let query = firestore()
        .collection("posts")
        .orderBy("timestamp", "desc")
        .where("sender", "in", userList)
        .limit(batchSize);

      // If a startAfterDoc is provided, modify the query to start after that document
      if (startAfterDoc) {
        query = query.startAfter(startAfterDoc);
      }

      // Execute the query and return the query snapshot
      return query.get();
    },
    []
  );

  /**
   * Retrieves the initial batch of posts from the users that the current user is following.
   * If no posts are found initially, the function attempts to expand the following list
   * and retries fetching posts with an exponential backoff strategy.
   */
  const getInitialFollowingPosts = useCallback(async () => {
    // Indicate that loading has started
    setIsLoading(true);
    setError(null);
    currentRetryCount.current = 0;

    try {
      // Step 1: Fetch the initial batch of "following" users
      const followingDocs = await fetchFollowingBatch();
      const followingIds = followingDocs.map((doc) => doc.id); // Extract user IDs from the documents

      // Store the initial list of following documents and their IDs
      setFollowingDocs(followingDocs);
      setFollowingList(followingIds);

      // If there are no users being followed, stop loading and exit early
      if (followingIds.length === 0) {
        setIsLoading(false);
        return;
      }

      // Step 2: Attempt to fetch posts from the current following list
      let postsSnapshot = await fetchPostsBatch(followingIds);

      // Step 3: Retry fetching posts with exponential backoff if results are empty
      while (
        postsSnapshot.docs.length === 0 && // Check if no posts are retrieved
        hasMoreFollowings.current && // Verify if there are more "following" users to fetch
        currentRetryCount.current < MAX_BATCH_RETRIES // Ensure retry count is within the limit
      ) {
        currentRetryCount.current++; // Increment retry count

        // Fetch the next batch of "following" users, starting after the last document
        const nextFollowingDocs = await fetchFollowingBatch(
          followingDocs[followingDocs.length - 1], // Start after the last fetched document
          MORE_FOLLOWING_COUNT // Fetch a predefined number of additional followings
        );

        // Extract user IDs from the new batch
        const nextFollowingIds = nextFollowingDocs.map((doc) => doc.id);

        // Update the state with the new "following" documents and IDs
        setFollowingDocs(nextFollowingDocs);
        setFollowingList(nextFollowingIds);

        // Retry fetching posts from the expanded following list
        postsSnapshot = await fetchPostsBatch([
          ...followingIds, // Include the initial user IDs
          ...nextFollowingIds, // Include the newly fetched user IDs
        ]);
      }

      // Step 4: Store the fetched posts in the state
      setFollowingPostDocs(postsSnapshot.docs);

      // Extract and store the paths to the post documents
      setFollowingPostDocPaths(
        postsSnapshot.docs.map(
          (d) => (d.data() as PostDataOnMainPostsCollection).postDocPath
        )
      );
    } catch (error) {
      // Handle any errors that occur during the process
      console.error("Error in getInitialFollowingPosts:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      // Indicate that loading has finished
      setIsLoading(false);
    }
  }, [fetchFollowingBatch, fetchPostsBatch]);

  const getMoreFollowingPosts = useCallback(async () => {
    if (
      isLoadingMore.current ||
      isUpdatingList.current ||
      !followingList.length
    ) {
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

      while (
        postsSnapshot.docs.length === 0 &&
        hasMoreFollowings.current &&
        currentRetryCount.current < MAX_BATCH_RETRIES
      ) {
        currentRetryCount.current++;
        await updateFollowingList();

        if (followingList.length > 0) {
          postsSnapshot = await fetchPostsBatch(
            followingList,
            undefined,
            MORE_POST_COUNT
          );
        }
      }

      if (postsSnapshot.docs.length > 0) {
        setFollowingPostDocs((prev) => [...prev, ...postsSnapshot.docs]);
        setFollowingPostDocPaths((prev) => [
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
      const newFollowingDocs = await fetchFollowingBatch(
        lastDoc,
        MORE_FOLLOWING_COUNT
      );

      if (newFollowingDocs.length > 0) {
        const newFollowingIds = newFollowingDocs.map((doc) => doc.id);
        setFollowingDocs(newFollowingDocs);
        setFollowingList(newFollowingIds);
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
