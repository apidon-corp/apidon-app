import { ActivityIndicator, Pressable, View } from "react-native";
import { Text } from "@/components/Text/Text";

import React, { useEffect, useState } from "react";
import { apidonPink } from "@/constants/Colors";
import { auth } from "@/firebase/client";
import { FollowStatusAPIResponseBody } from "@/types/ApiResponses";

type Props = {
  username: string | undefined;
};

const FollowButton = ({ username }: Props) => {
  const [loading, setLoading] = useState(false);

  const [doesFollow, setDoesFollow] = useState(false);

  const [followLoading, setFollowLoading] = useState(false);

  const handleGetFollowStatus = async () => {
    if (loading) return;

    const currentUserAuthObject = auth.currentUser;
    if (!currentUserAuthObject) return console.error("No user found!");

    const userPanelBaseUrl = process.env.EXPO_PUBLIC_USER_PANEL_ROOT_URL;
    if (!userPanelBaseUrl)
      return console.error("User panel base url couldnt fetch from .env file");

    if (!username) return console.error("Username is not defined");

    setLoading(true);

    try {
      const idToken = await currentUserAuthObject.getIdToken();

      const route = `${userPanelBaseUrl}/api/social/followStatus`;

      const response = await fetch(route, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          suspectUsername: username,
        }),
      });

      if (!response.ok) {
        setLoading(false);
        return console.error(
          "Response from followStatus is not okay: ",
          await response.json()
        );
      }

      const result = (await response.json()) as FollowStatusAPIResponseBody;

      setLoading(false);
      return setDoesFollow(result.doesRequesterFollowsSuspect);
    } catch (error) {
      setLoading(false);
      return console.error("Error on fetching followStatus API: : ", error);
    }
  };

  const handleFollowButton = async (action: "follow" | "unfollow") => {
    if (followLoading) return;

    setFollowLoading(true);

    const currentUserAuthObject = auth.currentUser;
    if (!currentUserAuthObject) return console.error("No user found!");

    const userPanelBaseUrl = process.env.EXPO_PUBLIC_USER_PANEL_ROOT_URL;
    if (!userPanelBaseUrl)
      return console.error("User panel base url couldnt fetch from .env file");

    const route = `${userPanelBaseUrl}/api/social/follow`;

    try {
      const idToken = await currentUserAuthObject.getIdToken();

      const response = await fetch(route, {
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
          await response.json()
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

  useEffect(() => {
    handleGetFollowStatus();
  }, [username]);

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
