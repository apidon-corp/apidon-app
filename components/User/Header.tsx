import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import FollowButton from "@/components/Follow/FollowButton";
import { Text } from "@/components/Text/Text";
import { apidonPink } from "@/constants/Colors";
import { UserInServer } from "@/types/User";
import { Feather } from "@expo/vector-icons";
import auth from "@react-native-firebase/auth";
import { Image } from "expo-image";
import { Stack, router, usePathname } from "expo-router";
import { useSetAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

type Props = {
  userData: UserInServer;
};

const Header = ({ userData }: Props) => {
  const pathname = usePathname();

  const [userOwnsPage, setUserOwnsPage] = useState(false);

  const setScreenParameters = useSetAtom(screenParametersAtom);

  useEffect(() => {
    if (userData.username) checkUserOwnsPage();
  }, [auth().currentUser, userData.username]);

  const handleEditProfileButton = () => {
    if (!userData) return;

    const subScreens = pathname.split("/");

    subScreens[subScreens.length - 1] =
      "editProfile" + "?" + `fullname=${userData.fullname}`;

    const finalDestination = subScreens.join("/");

    setScreenParameters((prev) => [
      { queryId: "editProfileImage", value: userData.profilePhoto },
      ...prev,
    ]);

    router.push(finalDestination);
  };

  const checkUserOwnsPage = () => {
    if (!auth().currentUser || !userData.username)
      return setUserOwnsPage(false);

    const displayName = auth().currentUser?.displayName;
    if (!displayName) return setUserOwnsPage(false);

    return setUserOwnsPage(displayName === userData.username);
  };

  function handlePressFollowers() {
    const subScreens = pathname.split("/");

    subScreens[subScreens.length - 1] =
      "followers" + "?" + `username=${userData.username}`;

    const finalDestination = subScreens.join("/");

    router.push(finalDestination);
  }

  const handlePressFollowing = () => {
    const subScreens = pathname.split("/");

    subScreens[subScreens.length - 1] =
      "following" + "?" + `username=${userData.username}`;

    const finalDestination = subScreens.join("/");

    router.push(finalDestination);
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
          source={userData.profilePhoto || require("@/assets/images/user.jpg")}
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
          @{userData.username}
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
                color: "gray",
              }}
              bold
            >
              5
            </Text>
            <Text
              style={{
                color: "white",
                fontSize: 15,
                textAlign: "center",
              }}
            >
              Score
            </Text>
          </View>

          <View
            style={{
              width: "20%",
            }}
          >
            <Pressable
              onPress={handlePressFollowers}
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
              onPress={handlePressFollowing}
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
