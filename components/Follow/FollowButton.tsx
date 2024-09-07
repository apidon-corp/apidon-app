import { Text } from "@/components/Text/Text";
import { ActivityIndicator, Pressable } from "react-native";

import { apidonPink } from "@/constants/Colors";
import apiRoutes from "@/helpers/ApiRoutes";
import firestore from "@react-native-firebase/firestore";
import React, { useEffect, useState } from "react";

import auth from "@react-native-firebase/auth";
import appCheck from "@react-native-firebase/app-check";
import { useAuth } from "@/providers/AuthProvider";

type Props = {
  username: string | undefined;
};

const FollowButton = ({ username }: Props) => {
  const { authStatus } = useAuth();

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

      const { token: appchecktoken } = await appCheck().getLimitedUseToken();

      const response = await fetch(apiRoutes.user.social.follow, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
          appchecktoken,
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

    setLoading(true);

    const unsubscribe = firestore()
      .doc(`users/${username}/followers/${displayName}`)
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) {
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
  }, [authStatus, username]);

  return (
    <Pressable
      onPress={() => {
        handleFollowButton(doesFollow ? "unfollow" : "follow");
      }}
      style={[
        {
          justifyContent: "center",
          alignItems: "center",
          height: 30,
          width: 85,
          borderColor: apidonPink,
          borderWidth: 1,
          borderRadius: 10,
          marginTop: 10,
        },
        !doesFollow && { backgroundColor: apidonPink },
      ]}
      disabled={loading || followLoading}
    >
      {loading || followLoading ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <Text
          fontSize={13}
          style={{
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
