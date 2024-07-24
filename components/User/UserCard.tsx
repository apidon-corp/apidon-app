import { Text } from "@/components/Text/Text";
import { apidonPink } from "@/constants/Colors";
import apiRoutes from "@/helpers/ApiRoutes";
import { FollowStatusAPIResponseBody } from "@/types/ApiResponses";
import { UserInServer } from "@/types/User";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

import appCheck from "@react-native-firebase/app-check";

type Props = {
  username: string;
};

const UserCard = ({ username }: Props) => {
  const [userData, setUserData] = useState<UserInServer>();
  const [loading, setLoading] = useState(false);

  const [doesFollow, setDoesFollow] = useState(true);

  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    handleGetUserData();
    handleGetFollowStatus();
  }, [username]);

  const handleGetUserData = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const userDocSnapshot = await firestore().doc(`users/${username}`).get();

      if (!userDocSnapshot.exists) return;

      const userDocData = userDocSnapshot.data() as UserInServer;

      setUserData(userDocData);
      return setLoading(false);
    } catch (error) {
      console.error("Error on getting initial data: ", error);
      return setLoading(false);
    }
  };

  const handleGetFollowStatus = async () => {
    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return console.error("No user found!");

    const displayName = currentUserAuthObject.displayName;
    if (username === displayName) return setDoesFollow(true);

    try {
      const idToken = await currentUserAuthObject.getIdToken();

      const { token: appchecktoken } = await appCheck().getLimitedUseToken();

      const response = await fetch(apiRoutes.user.social.getFollowStatus, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
          appchecktoken: appchecktoken,
        },
        body: JSON.stringify({
          suspectUsername: username,
        }),
      });

      if (!response.ok) {
        return console.error(
          "Response from followStatus is not okay: ",
          await response.json()
        );
      }

      const result = (await response.json()) as FollowStatusAPIResponseBody;

      return setDoesFollow(result.doesRequesterFollowsSuspect);
    } catch (error) {
      return console.error("Error on fetching followStatus API: : ", error);
    }
  };

  const handleFollowButton = async () => {
    if (followLoading) return;

    setFollowLoading(true);

    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return console.error("No user found!");

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
          opCode: 1,
        }),
      });

      if (!response.ok) {
        console.error(
          "Response from follow API is not okay: ",
          await response.text()
        );
        return setFollowLoading(false);
      }

      setDoesFollow(true);
      return setFollowLoading(true);
    } catch (error) {
      console.error("Error on fetching follow API: : ", error);
      return setFollowLoading(false);
    }
  };

  if (loading || !userData)
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: 75,
        }}
      >
        <ActivityIndicator color="white" />
      </View>
    );

  return (
    <View
      style={{
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        height: 75,
      }}
    >
      <View
        style={{
          alignItems: "center",
        }}
      >
        <Pressable
          style={{
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
          }}
          onPress={() => {
            router.push(`/home/profile/${username}`);
          }}
        >
          <Image
            source={
              userData.profilePhoto || require("@/assets/images/user.jpg")
            }
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
            }}
            transition={500}
          />
          <View>
            <Text
              style={{
                fontSize: 14,
              }}
              bold
            >
              {userData.username}
            </Text>
            <Text
              style={{
                fontSize: 14,
              }}
            >
              {userData.fullname}
            </Text>
          </View>
        </Pressable>
      </View>

      {!doesFollow && (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Pressable
            style={{
              backgroundColor: apidonPink,
              alignItems: "center",
              justifyContent: "center",
              padding: 10,
              borderRadius: 10,
            }}
            onPress={handleFollowButton}
            disabled={followLoading}
          >
            {followLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                style={{
                  fontSize: 14,
                }}
              >
                Follow
              </Text>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default UserCard;
