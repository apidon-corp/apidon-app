import { Text } from "@/components/Text/Text";
import { ActivityIndicator, Pressable } from "react-native";

import { apidonPink } from "@/constants/Colors";
import { firestore } from "@/firebase/client";
import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import apiRoutes from "@/helpers/ApiRoutes";

import auth from "@react-native-firebase/auth";

type Props = {
  username: string | undefined;
};

const FollowButton = ({ username }: Props) => {
  const [loading, setLoading] = useState(false);

  const [doesFollow, setDoesFollow] = useState(false);

  const [followLoading, setFollowLoading] = useState(false);

  const handleFollowButton = async (action: "follow" | "unfollow") => {
    if (followLoading) return;

    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return console.error("No user found!");

    setFollowLoading(true);

    try {
      const idToken = await currentUserAuthObject.getIdToken();

      const response = await fetch(apiRoutes.user.social.follow, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          operationTo: username,
          opCode: action === "follow" ? 1 : -1,
        }),
      });

      if (!response.ok) {
        console.error(
          "Response from follow API is not okay: ",
          await response.text()
        );
        return setFollowLoading(false);
      }

      setDoesFollow(action === "follow" ? true : false);
      return setFollowLoading(false);
    } catch (error) {
      console.error("Error on fetching follow API: : ", error);
      return setFollowLoading(false);
    }
  };

  // Dynamic Data Fetching / Current User
  useEffect(() => {
    if (loading) return;

    const displayName = auth().currentUser?.displayName;
    if (!displayName) return;

    if (!username) return;

    const postSenderFollowingDocOnCurrentUser = doc(
      firestore,
      `/users/${username}/followers/${displayName}`
    );

    setLoading(true);

    const unsubscribe = onSnapshot(
      postSenderFollowingDocOnCurrentUser,
      (snapshot) => {
        if (!snapshot.exists()) {
          setDoesFollow(false);
        } else {
          setDoesFollow(true);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error on getting realtime data: ", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth().currentUser, username]);

  return (
    <Pressable
      onPress={() => {
        handleFollowButton(doesFollow ? "unfollow" : "follow");
      }}
      style={
        doesFollow
          ? {
              borderColor: apidonPink,
              borderWidth: 1,
              borderRadius: 10,
              paddingHorizontal: 15,
              paddingVertical: 5,
              marginTop: 10,
            }
          : {
              backgroundColor: apidonPink,
              borderRadius: 10,
              paddingHorizontal: 15,
              paddingVertical: 5,
              marginTop: 10,
            }
      }
      disabled={loading || followLoading}
    >
      {loading || followLoading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text
          style={{
            fontSize: 14,
            textAlign: "center",
          }}
          bold
        >
          {doesFollow ? "Followed" : "Follow"}
        </Text>
      )}
    </Pressable>
  );
};

export default FollowButton;
