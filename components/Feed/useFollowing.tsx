import { useRef, useState, useCallback } from "react";
import auth from "@react-native-firebase/auth";
import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { PostDataOnMainPostsCollection } from "@/types/Post";

const FOLLOWING_QUERY_LIMIT = 1;
const POSTS_QUERY_LIMIT = 3;
const INITIAL_TIME_INTERVAL = 30;
const TIME_INTERVAL_INCREMENT = 30;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

type QuerySnapshot =
  FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>;

interface UseFollowingReturn {
  followingPostDocPaths: string[];
  getFollowingPosts: () => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export function useFollowing(): UseFollowingReturn {
  const [timeInterval, setTimeInterval] = useState(INITIAL_TIME_INTERVAL);
  const [followingDocs, setFollowingDocs] = useState<QuerySnapshot[]>([]);
  const [postDocs, setPostDocs] = useState<QuerySnapshot[]>([]);
  const [followingPostDocPaths, setFollowingPostDocPaths] = useState<string[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);

  // Refs for tracking states
  const isGettingFollowings = useRef(false);
  const isGettingPosts = useRef(false);
  const isThereMoreFollowings = useRef(true);
  const isThereMorePosts = useRef(false);
  const isGettingFollowingPosts = useRef(false);

  const getDisplayName = useCallback((): string => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser?.displayName) {
        throw new Error("No authenticated user or display name found");
      }
      return currentUser.displayName;
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to get display name"
      );
      return "";
    }
  }, []);

  const getFollowings = useCallback(
    async (startAfterDoc?: QuerySnapshot): Promise<QuerySnapshot[]> => {
      if (isGettingFollowings.current) {
        throw new Error("Already fetching followings");
      }

      isGettingFollowings.current = true;
      const displayName = getDisplayName();

      if (!displayName) {
        throw new Error("Display name not found");
      }

      try {
        const followingQuery = firestore()
          .collection("users")
          .doc(displayName)
          .collection("followings")
          .orderBy("followTime", "desc")
          .limit(FOLLOWING_QUERY_LIMIT);

        const query = startAfterDoc
          ? followingQuery.startAfter(startAfterDoc)
          : followingQuery;

        const snapshot = await query.get();
        isThereMoreFollowings.current =
          snapshot.docs.length === FOLLOWING_QUERY_LIMIT;

        return snapshot.docs;
      } catch (error) {
        throw new Error(`Error fetching followings: ${error}`);
      } finally {
        isGettingFollowings.current = false;
      }
    },
    [getDisplayName]
  );

  const getPosts = useCallback(
    async (
      followingList: string[],
      timestamp: number,
      startAfterDoc?: QuerySnapshot
    ): Promise<QuerySnapshot[]> => {
      if (isGettingPosts.current) {
        throw new Error("Already fetching posts");
      }
      if (followingList.length === 0) {
        return [];
      }

      isGettingPosts.current = true;

      try {
        const postsQuery = firestore()
          .collection("posts")
          .orderBy("timestamp", "desc")
          .where("timestamp", ">", timestamp)
          .where("sender", "in", followingList)
          .limit(POSTS_QUERY_LIMIT);

        const query = startAfterDoc
          ? postsQuery.startAfter(startAfterDoc)
          : postsQuery;

        const snapshot = await query.get();
        isThereMorePosts.current = snapshot.docs.length === POSTS_QUERY_LIMIT;

        return snapshot.docs;
      } catch (error) {
        throw new Error(`Error fetching posts: ${error}`);
      } finally {
        isGettingPosts.current = false;
      }
    },
    []
  );

  const getFollowingPosts = useCallback(
    async (optionalTimestamp?: number): Promise<boolean> => {
      if (isGettingFollowingPosts.current) {
        return false;
      }

      isGettingFollowingPosts.current = true;
      setError(null);

      try {
        let timestamp = Date.now() - timeInterval * MILLISECONDS_PER_DAY;

        if (optionalTimestamp) timestamp = optionalTimestamp;

        // Handle fetching more posts for current followings
        if (isThereMorePosts.current) {
          const currentFollowingIds = followingDocs.map((doc) => doc.id);
          const newPostsDocs = await getPosts(
            currentFollowingIds,
            timestamp,
            postDocs[postDocs.length - 1]
          );

          setPostDocs((prev) => [...prev, ...newPostsDocs]);
          setFollowingPostDocPaths((prev) => [
            ...prev,
            ...newPostsDocs.map(
              (doc) => (doc.data() as PostDataOnMainPostsCollection).postDocPath
            ),
          ]);
          return true;
        }

        // Fetch new followings
        const lastFollowingDoc = followingDocs[followingDocs.length - 1];
        const newFollowingDocs = await getFollowings(lastFollowingDoc);
        setFollowingDocs(newFollowingDocs);

        // Fetch posts for new followings
        const newFollowingIds = newFollowingDocs.map((doc) => doc.id);
        const lastPostDoc = postDocs[postDocs.length - 1];
        let newPostsDocs = await getPosts(
          newFollowingIds,
          timestamp,
          lastPostDoc
        );

        // Handle case when no posts are found
        if (newPostsDocs.length === 0 && isThereMoreFollowings.current) {
          let attempts = 0;
          const MAX_ATTEMPTS = 3;

          while (
            newPostsDocs.length === 0 &&
            isThereMoreFollowings.current &&
            attempts < MAX_ATTEMPTS
          ) {
            attempts++;
            const nextFollowingDocs = await getFollowings(
              newFollowingDocs[newFollowingDocs.length - 1]
            );

            setFollowingDocs(nextFollowingDocs);

            const nextFollowingIds = nextFollowingDocs.map((doc) => doc.id);
            const additionalPosts = await getPosts(nextFollowingIds, timestamp);
            newPostsDocs = [...newPostsDocs, ...additionalPosts];
          }
        }

        // If still no posts, increase time interval and retry
        if (newPostsDocs.length === 0) {
          setTimeInterval((prev) => {
            const newTimestamp = prev + TIME_INTERVAL_INCREMENT;

            getFollowingPosts(newTimestamp);

            return newTimestamp;
          });
        }

        // Update post docs and paths
        setPostDocs((prev) => {
          const newPaths = [
            ...prev.map(
              (doc) => (doc.data() as PostDataOnMainPostsCollection).postDocPath
            ),
            ...newPostsDocs.map(
              (doc) => (doc.data() as PostDataOnMainPostsCollection).postDocPath
            ),
          ];
          setFollowingPostDocPaths(newPaths);
          return [...prev, ...newPostsDocs];
        });

        return true;
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch following posts"
        );
        return false;
      } finally {
        isGettingFollowingPosts.current = false;
      }
    },
    [timeInterval, followingDocs, postDocs, getFollowings, getPosts]
  );

  return {
    followingPostDocPaths,
    getFollowingPosts,
    isLoading: isGettingFollowingPosts.current,
    error,
  };
}
