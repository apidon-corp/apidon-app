import { useEffect, useRef, useState } from "react";

import auth from "@react-native-firebase/auth";
import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";

type FirestoreDocType =
  FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>;

const FOLLOWINGS_QUERY_LIMIT = 30;
const POSTS_QUERY_LIMIT = 8;

const ONE_DAY_IN_EPOCH = 24 * 60 * 60 * 1000;
const ONE_YEAR_IN_EPOCH = ONE_DAY_IN_EPOCH * 365;

const INITIAL_TIME_INTERVAL = 3;
const TIME_INTERVAL_INCREAMENT = 3;

/**
 * Creates a promise that resolves after a specified delay
 * @param ms The delay duration in milliseconds
 * @param value Optional value to pass through the promise
 * @returns Promise that resolves after the specified delay
 */
function delay<T = void>(ms: number, value?: T): Promise<T> {
  return new Promise<T>((resolve) => setTimeout(() => resolve(value as T), ms));
}

export function useFollowingPosts() {
  const [timeInterval, setTimeInterval] = useState(INITIAL_TIME_INTERVAL);

  const [followingDocs, setFollowingDocs] = useState<FirestoreDocType[]>([]);
  const [postDocs, setPostDocs] = useState<FirestoreDocType[]>([]);

  const [followingPostDocPaths, setFollowingPostDocPaths] = useState<string[]>(
    []
  );

  const isGettingFollowings = useRef(false);
  const isGettingPosts = useRef(false);

  const isCurrentQueryHasMorePosts = useRef(false);

  const isGettingFollowingPosts = useRef(false);

  // Whenever postDocs changes, followingPostDocPaths changes also.
  useEffect(() => {
    setFollowingPostDocPaths(
      postDocs.map((doc) => doc.data().postDocPath as string)
    );
  }, [postDocs]);

  const getFollowings = async (startAfterDoc?: FirestoreDocType) => {
    if (isGettingFollowings.current) return false;
    isGettingFollowings.current = true;

    const displayName = auth().currentUser?.displayName;
    if (!displayName) {
      console.error("No authenticated user found");
      isGettingFollowings.current = false;
      return false;
    }

    try {
      let followingsQuery = firestore()
        .collection("users")
        .doc(displayName)
        .collection("followings")
        .orderBy("followTime", "desc")
        .limit(FOLLOWINGS_QUERY_LIMIT);

      if (startAfterDoc)
        followingsQuery = followingsQuery.startAfter(startAfterDoc);

      const querySnapshot = await followingsQuery.get();

      isGettingFollowings.current = false;

      return querySnapshot.docs;
    } catch (error) {
      console.error("Error fetching followings:", error);
      isGettingFollowings.current = false;
      return false;
    }
  };

  const getPosts = async (
    userList: string[],
    timestamp: number,
    startAfterDoc?: FirestoreDocType
  ) => {
    if (isGettingPosts.current) return false;

    // Ref Update
    isGettingPosts.current = true;

    try {
      let postsQuery = firestore()
        .collection("posts")
        .orderBy("timestamp", "desc")
        .where("timestamp", ">=", timestamp)
        .where("sender", "in", userList)
        .limit(POSTS_QUERY_LIMIT);

      if (startAfterDoc) postsQuery = postsQuery.startAfter(startAfterDoc);

      const snapshot = await postsQuery.get();

      // Ref Updates
      isGettingPosts.current = false;
      isCurrentQueryHasMorePosts.current =
        snapshot.docs.length === POSTS_QUERY_LIMIT;

      return snapshot.docs;
    } catch (error) {
      console.error("Error fetching posts:", error);

      // Ref Updates
      isGettingPosts.current = false;
      isCurrentQueryHasMorePosts.current = false;

      return false;
    }
  };

  const getFollowingPosts = async () => {
    /**
     * If current query, has more posts to show use current query paramters like current followings, timestamp.
     *  If not:
     * Get new Followings. (replace it directly with old)
     * Look posts from following through timestamp.
     * If no posts returned:
     *      - Look for other followings in while loop until there is no other followings.
     *      - And fetch posts from the these new followings.
     *    - When there is no more followings, left:
     *      - Increase time interval.
     *      - Clear followings and fetch followings from start.
     *      - Fetch posts from these new followings.
     *      - If there is no posts returned, repeat the process.
     */

    if (isGettingFollowingPosts.current) return false;
    isGettingFollowingPosts.current = true;

    if (isCurrentQueryHasMorePosts.current) {
      const currentTimestamp = Date.now() - timeInterval * ONE_DAY_IN_EPOCH;
      const currentLastDoc = postDocs[postDocs.length - 1];
      const currentUserList = followingDocs.map((d) => d.id);

      const newPostsFromCurrentQuery = await getPosts(
        currentUserList,
        currentTimestamp,
        currentLastDoc
      );

      if (!newPostsFromCurrentQuery) {
        isGettingFollowingPosts.current = false;
        return false;
      }

      if (newPostsFromCurrentQuery.length === 0) {
        // It should go directly, to the below.
        // return false;
      } else {
        setPostDocs((prev) => [...prev, ...newPostsFromCurrentQuery]);

        isGettingFollowingPosts.current = false;

        return true;
      }
    }

    let isAnyOtherPostsFound = false;

    let newFollowings: FirestoreDocType[] | false = followingDocs;

    /**
     * Local Time Interval
     */
    let timeIntervalL = timeInterval;
    let timestamp = Date.now() - timeIntervalL * ONE_DAY_IN_EPOCH;

    while (!isAnyOtherPostsFound) {
      let followingStartAfterDoc: FirestoreDocType | undefined = undefined;

      if (newFollowings.length > 0)
        followingStartAfterDoc = newFollowings[newFollowings.length - 1];

      newFollowings = await getFollowings(followingStartAfterDoc);
      if (!newFollowings) {
        isGettingFollowingPosts.current = false;
        return false;
      }

      if (newFollowings.length === 0) {
        const newTimeInterval = timeIntervalL + TIME_INTERVAL_INCREAMENT;

        //  State Updates
        setTimeInterval(newTimeInterval);

        // Because state updates is slow, we manually change locally, too.
        timeIntervalL = newTimeInterval;

        // Becase state updates is slow, we manually change locally, too.
        timestamp = Date.now() - newTimeInterval * ONE_DAY_IN_EPOCH;

        if (timestamp < Date.now() - ONE_YEAR_IN_EPOCH) {
          isGettingFollowingPosts.current = false;
          return false;
        }

        //  State Updates
        setFollowingDocs([]);

        // Because state updates is slow, we manually change locally, too.
        newFollowings = [];

        continue;
      }

      const userList = newFollowings.map((doc) => doc.id);

      let postStartAfterDoc: FirestoreDocType | undefined = undefined;
      if (postDocs.length > 0)
        postStartAfterDoc = postDocs[postDocs.length - 1];

      const newPosts = await getPosts(userList, timestamp, postStartAfterDoc);
      if (!newPosts) {
        isGettingFollowingPosts.current = false;
        return false;
      }

      if (newPosts.length === 0) {
        continue;
      }

      // State Updates
      setFollowingDocs(newFollowings);
      setPostDocs((prev) => [...prev, ...newPosts]);

      // Since we exit from loop, we don't need to change varaibles locally, too.

      isAnyOtherPostsFound = true;
    }

    isGettingFollowingPosts.current = false;
  };

  const refreshFollowingPosts = async () => {
    setTimeInterval(INITIAL_TIME_INTERVAL);
    setFollowingDocs([]);

    setPostDocs([]);
    setFollowingPostDocPaths([]);

    isGettingFollowings.current = false;
    isGettingPosts.current = false;
    isCurrentQueryHasMorePosts.current = false;
    isGettingFollowingPosts.current = false;

    // Waiting for state update.
     await delay(1000);

    await getFollowingPosts();
  };

  return {
    getFollowingPosts,
    followingPostDocPaths,
    refreshFollowingPosts,
    isGettingFollowingPosts: isGettingFollowingPosts.current,
  };
}
