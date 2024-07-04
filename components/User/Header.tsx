import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import FollowButton from "@/components/Follow/FollowButton";
import { Text } from "@/components/Text/Text";
import { apidonPink } from "@/constants/Colors";
import { auth } from "@/firebase/client";
import { UserInServer } from "@/types/User";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, router } from "expo-router";
import { useSetAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

type Props = {
  userData: UserInServer;
};

const Header = ({ userData }: Props) => {
  const setScreenParams = useSetAtom(screenParametersAtom);

  const [userOwnsPage, setUserOwnsPage] = useState(false);

  useEffect(() => {
    if (userData.username) checkUserOwnsPage();
  }, [auth.currentUser, userData.username]);

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
    if (!auth.currentUser || !userData.username) return setUserOwnsPage(false);

    const displayName = auth.currentUser.displayName;
    if (!displayName) return setUserOwnsPage(false);

    return setUserOwnsPage(displayName === userData.username);
  };

  if (!userData) return <ActivityIndicator size="large" color="white" />;

  return (
    <>
      {userOwnsPage && (
        <Stack.Screen
          options={{
            headerRight: () => (
              <Pressable
                onPress={() => {
                  router.push("/(modals)/settings");
                }}
              >
                <Feather name="settings" size={23} color="white" />
              </Pressable>
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
                    value: userData.username,
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
                    value: userData.username,
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
        ) : (
          <FollowButton username={userData.username} />
        )}
      </View>
    </>
  );
};

export default Header;
