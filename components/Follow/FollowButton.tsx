import { Text } from "@/components/Text/Text";
import { View } from "react-native";

import { apidonPink } from "@/constants/Colors";
import apiRoutes from "@/helpers/ApiRoutes";
import firestore from "@react-native-firebase/firestore";
import React, { useEffect, useState } from "react";

import { useAuth } from "@/providers/AuthProvider";
import appCheck from "@react-native-firebase/app-check";
import auth from "@react-native-firebase/auth";
import { ThemedButton } from "react-native-really-awesome-button";

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
    <View
      style={{
        marginTop: 10,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}
    >
      <ThemedButton
        progress
        onPress={async (next) => {
          await handleFollowButton(doesFollow ? "unfollow" : "follow");
          if (next) next();
        }}
        backgroundProgress="rgb(25, 25, 25)"
        name="rick"
        width={80}
        height={35}
        paddingBottom={0}
        paddingHorizontal={0}
        paddingTop={0}
        backgroundColor={apidonPink}
        backgroundDarker="rgba(213, 63, 140, 0.5)"
      >
        <Text fontSize={12} bold>
          {doesFollow ? "Followed" : "Follow"}
        </Text>
      </ThemedButton>
    </View>
  );
};

export default FollowButton;
