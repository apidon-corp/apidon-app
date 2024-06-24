import { auth, firestore } from "@/firebase/client";
import { UserInServer } from "@/types/User";
import { Stack, router } from "expo-router";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Switch, View } from "react-native";

import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import FollowButton from "@/components/Follow/FollowButton";
import { Text } from "@/components/Text/Text";
import { apidonPink } from "@/constants/Colors";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useSetAtom } from "jotai";

type Props = {
  username: string;
};

const Header = ({ username }: Props) => {
  const [loading, setLoading] = useState(false);

  const [userData, setUserData] = useState<UserInServer | null>(null);

  const setScreenParams = useSetAtom(screenParametersAtom);

  const [userOwnsPage, setUserOwnsPage] = useState(false);

  useEffect(() => {
    if (username) handleGetProfileData();
  }, [username]);

  // Dynamic Data Fetching
  useEffect(() => {
    const userDocRef = doc(firestore, `/users/${username}`);

    const unsubscribe = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          console.error("User's realtime data can not be fecthed.");
          return setUserData(null);
        }

        const userDocData = snapshot.data() as UserInServer;

        setUserData(userDocData);
      },
      (error) => {
        console.error("Error on getting realtime data: ", error);
        return setUserData(null);
      }
    );

    return () => unsubscribe();
  }, [username]);

  useEffect(() => {
    checkUserOwnsPage();
  }, [username, auth.currentUser]);

  // Initially getting user data...
  const handleGetProfileData = async () => {
    if (!username) return;
    if (loading) return;

    setLoading(true);

    try {
      const userDocRef = doc(firestore, `/users/${username}`);

      const userDocSnapshot = await getDoc(userDocRef);

      if (!userDocSnapshot.exists()) return console.error("User not found");

      const userDocData = userDocSnapshot.data() as UserInServer;

      setUserData(userDocData);

      return setLoading(false);
    } catch (error) {
      console.error("Error on getting profile data: ", error);
      return setLoading(false);
    }
  };

  const handleEditProfileButton = () => {
    if (!userData) return;

    setScreenParams([
      { queryId: "image", value: userData.profilePhoto },
      {
        queryId: "fullname",
        value: userData.fullname,
      },
    ]);

    router.push("/home/profile/editProfile");
  };

  const checkUserOwnsPage = () => {
    if (!auth.currentUser || !username) return setUserOwnsPage(false);

    const displayName = auth.currentUser.displayName;
    if (!displayName) return setUserOwnsPage(false);

    return setUserOwnsPage(displayName === username);
  };

  if (!userData) return <ActivityIndicator size="large" color="white" />;

  return (
    <>
      {userOwnsPage && (
        <Stack.Screen
          options={{
            headerRight: () => (
              <Ionicons
                name="notifications"
                color="white"
                size={23}
                style={{}}
              />
            ),
            headerLeft: () => (
              <FontAwesome name="chain" color="white" size={23} style={{}} />
            ),
          }}
        />
      )}

      <View
        id="header"
        style={{
          padding: 10,
          alignItems: "center",
          gap: 5,
        }}
      >
        <Image
          source={userData.profilePhoto}
          style={{
            height: 150,
            width: 150,
            borderRadius: 75,
          }}
          transition={500}
        />
        <Text
          bold
          style={{
            fontSize: 25,
            textAlign: "center",
          }}
        >
          {userData.fullname}
        </Text>
        <Text
          style={{
            color: "white",
            fontSize: 14,
            textAlign: "center",
          }}
        >
          Istanbul, Turkey
        </Text>
        <View
          style={{
            flexDirection: "row",
            gap: 20,
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            marginTop: 10,
          }}
        >
          <View
            style={{
              gap: 4,
              width: "20%",
            }}
          >
            <Text
              style={{
                fontSize: 15,
                textAlign: "center",
              }}
              bold
            >
              {userData.nftCount}
            </Text>
            <Text
              style={{
                color: "white",
                fontSize: 15,
                textAlign: "center",
              }}
            >
              NFT
            </Text>
          </View>

          <View
            style={{
              width: "20%",
            }}
          >
            <Pressable
              onPress={() => {
                setScreenParams([
                  {
                    queryId: "username",
                    value: username,
                  },
                ]);
                router.push("/home/profile/followers");
              }}
              style={{
                gap: 4,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 15,
                  textAlign: "center",
                }}
                bold
              >
                {userData.followerCount}
              </Text>
              <Text
                style={{
                  color: "white",
                  fontSize: 15,
                  textAlign: "center",
                }}
              >
                Followers
              </Text>
            </Pressable>
          </View>

          <View
            style={{
              gap: 4,
              width: "20%",
            }}
          >
            <Pressable
              style={{
                gap: 4,
              }}
              onPress={() => {
                setScreenParams([
                  {
                    queryId: "username",
                    value: username,
                  },
                ]);
                router.push("/home/profile/following");
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 15,
                  textAlign: "center",
                }}
                bold
              >
                {userData.followingCount}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  textAlign: "center",
                }}
              >
                Following
              </Text>
            </Pressable>
          </View>
        </View>
        {userOwnsPage ? (
          <>
            <Pressable
              onPress={() => {
                auth.signOut();
              }}
            >
              <Text
                bold
                style={{
                  color: "red",
                }}
              >
                Sign Out
              </Text>
            </Pressable>
            <Pressable
              onPress={handleEditProfileButton}
              style={{
                borderColor: apidonPink,
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 15,
                paddingVertical: 5,
                marginTop: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  textAlign: "center",
                }}
                bold
              >
                Edit Profile
              </Text>
            </Pressable>
          </>
        ) : (
          <FollowButton username={username} />
        )}
      </View>
    </>
  );
};

export default Header;
