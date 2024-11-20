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
import { MaterialIcons } from "@expo/vector-icons";

type Props = {
  username: string;
};

const UserCard = ({ username }: Props) => {
  const { authStatus } = useAuth();

  const [userData, setUserData] = useState<UserInServer>();
  const [loading, setLoading] = useState(false);

  const [doesFollow, setDoesFollow] = useState(true);

  const [followLoading, setFollowLoading] = useState(false);

  const pathname = usePathname();

  const [currentUserBlockedBySender, setCurrentUserBlockedBySender] = useState<
    null | boolean
  >(null);

  // Realtime Block Checking
  useEffect(() => {
    if (!username) return;

    const displayName = auth().currentUser?.displayName || "";
    if (!displayName) return;

    if (username === displayName) return setCurrentUserBlockedBySender(false);

    const unsubscribe = firestore()
      .doc(`users/${username}/blocks/${displayName}`)
      .onSnapshot(
        (snapshot) => {
          setCurrentUserBlockedBySender(snapshot.exists);
        },
        (error) => {
          console.error("Error on getting realtime data  ", error);
          setCurrentUserBlockedBySender(null);
        }
      );

    return () => unsubscribe();
  }, [username]);

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

    if (
      currentScreen === "followers" ||
      currentScreen === "following" ||
      currentScreen === "collectors" ||
      currentScreen === "rates"
    ) {
      subScreens[subScreens.length - 1] = `profilePage?username=${username}`;
      const finalDestination = subScreens.join("/");
      return router.push(finalDestination);
    }

    if (currentScreen === "search") {
      subScreens.push(`profilePage?username=${username}`);
      const finalDestination = subScreens.join("/");
      return router.push(finalDestination);
    }

    console.error("Hmm");
  };

  if (loading || !userData || currentUserBlockedBySender === null)
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

  if (currentUserBlockedBySender || userData.isScheduledToDelete) {
    return <></>;
  }

  return (
    <Pressable
      onPress={handlePressUser}
      style={{
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        height: 75,
        width: "100%",
      }}
    >
      <View
        style={{
          overflow: "hidden",
          width: "75%",
          flexDirection: "row",
          gap: 10,
          alignItems: "center",
        }}
      >
        <Image
          source={userData.profilePhoto || require("@/assets/images/user.jpg")}
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
          }}
        />
        <View id="username-fullname">
          <View
            id="fullname-verified"
            style={{ flexDirection: "row", gap: 3, alignItems: "center" }}
          >
            <Text
              style={{
                fontSize: 13,
              }}
              bold
            >
              {userData.fullname}
            </Text>
            {userData.verified && (
              <MaterialIcons name="verified" size={14} color={apidonPink} />
            )}
          </View>

          <Text
            style={{
              fontSize: 12,
              color: "gray",
            }}
          >
            @{userData.username}
          </Text>
        </View>
      </View>

      {!doesFollow && (
        <View
          style={{
            width: "25%",
            height: 50,
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <Pressable
            style={{
              width: "75%",
              height: "55%",
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 10,
            }}
            onPress={handleFollowButton}
            disabled={followLoading}
          >
            {followLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                bold
                style={{
                  fontSize: 12,
                }}
              >
                Follow
              </Text>
            )}
          </Pressable>
        </View>
      )}
    </Pressable>
  );
};

export default UserCard;
