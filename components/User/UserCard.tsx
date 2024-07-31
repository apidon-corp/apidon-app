import { Text } from "@/components/Text/Text";
import { apidonPink } from "@/constants/Colors";
import apiRoutes from "@/helpers/ApiRoutes";
import { UserInServer } from "@/types/User";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { Image } from "expo-image";
import { router, usePathname } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

import { useAuth } from "@/providers/AuthProvider";
import appCheck from "@react-native-firebase/app-check";

type Props = {
  username: string;
  destinationIn?: boolean;
};

const UserCard = ({ username, destinationIn }: Props) => {
  const { authStatus } = useAuth();

  const [userData, setUserData] = useState<UserInServer>();
  const [loading, setLoading] = useState(false);

  const [doesFollow, setDoesFollow] = useState(true);

  const [followLoading, setFollowLoading] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    handleGetUserData();
  }, [username]);

  // Dynamic Data Fetching / Follow Status
  useEffect(() => {
    if (authStatus !== "authenticated") return;

    const displayName = auth().currentUser?.displayName;
    if (!displayName) return;

    if (displayName === username) return setDoesFollow(true);

    const unsubscribe = firestore()
      .doc(`users/${username}/followers/${displayName}`)
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) {
            setDoesFollow(false);
          } else {
            setDoesFollow(true);
          }
        },
        (error) => {
          console.error("Error on getting realtime data: ", error);
        }
      );

    return () => unsubscribe();
  }, [authStatus, username]);

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

  const handleFollowButton = async () => {
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
      return setFollowLoading(false);
    } catch (error) {
      console.error("Error on fetching follow API: : ", error);
      return setFollowLoading(false);
    }
  };

  const handlePressUser = async () => {
    const subScreens = pathname.split("/");

    const currentScreen = subScreens[subScreens.length - 1];

    if (currentScreen === "followers" || currentScreen === "following") {
      subScreens[subScreens.length - 1] = username;
      const finalDestination = subScreens.join("/");
      return router.push(finalDestination);
    }

    if (!destinationIn)
      subScreens[subScreens.length - 1] = "profile/" + username;

    if (destinationIn) subScreens.push(`profile/${username}`);

    const finalDestination = subScreens.join("/");

    router.push(finalDestination);
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
          onPress={handlePressUser}
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
