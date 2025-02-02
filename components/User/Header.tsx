import FollowButton from "@/components/Follow/FollowButton";
import { Text } from "@/components/Text/Text";
import { apidonPink } from "@/constants/Colors";
import { UserInServer } from "@/types/User";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import auth from "@react-native-firebase/auth";
import { Image } from "expo-image";
import { router, usePathname } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Buffer } from "buffer";
import CustomBottomModalSheet from "../BottomSheet/CustomBottomModalSheet";
import UserSettingsBottomSheetModalContent from "./UserSettingsBottomSheetModalContent";

type Props = {
  userData: UserInServer;
  collsCount: number;
};

const Header = ({ userData, collsCount }: Props) => {
  const pathname = usePathname();

  const [userOwnsPage, setUserOwnsPage] = useState(false);

  const userSettingsBottomModalRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (userData.username) checkUserOwnsPage();
  }, [auth().currentUser, userData.username]);

  const handleEditProfileButton = () => {
    if (!userData) return;
    if (!userOwnsPage) return;

    const subScreens = pathname.split("/");

    const image = Buffer.from(userData.profilePhoto).toString("base64");

    const query = `editProfile?fullname=${userData.fullname}&image=${image}`;

    subScreens[subScreens.length - 1] = query;

    const finalDestination = subScreens.join("/");
    return router.push(finalDestination);
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

  const handlePressSettingsButton = () => {
    userSettingsBottomModalRef.current?.present();
  };

  if (!userData) return <ActivityIndicator size="large" color="white" />;

  return (
    <>
      <View
        id="header"
        style={{
          padding: 10,
          alignItems: "center",
          gap: 5,
        }}
      >
        <View
          id="share-part"
          style={{
            width: "100%",
          }}
        >
          <View
            style={{
              width: "100%",
              alignItems: "flex-end",
              paddingHorizontal: 5,
            }}
          >
            <Pressable onPress={handlePressSettingsButton}>
              <Entypo name="dots-three-vertical" size={21} color="white" />
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={handleEditProfileButton}
          id="image-part"
          style={{
            width: 150,
            aspectRatio: 1,
            display: "flex",
            position: "relative",
          }}
        >
          <Image
            source={
              userData.profilePhoto || require("@/assets/images/user.jpg")
            }
            style={{
              height: 150,
              width: 150,
              borderRadius: 75,
            }}
            transition={100}
          />

          <View
            id="edit-button"
            style={{
              display: userOwnsPage ? "flex" : "none",
              position: "absolute",
              width: 25,
              aspectRatio: 1,
              backgroundColor: "white",
              borderRadius: 50,
              bottom: 10,
              left: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialIcons name="edit" size={17} color="black" />
          </View>
        </Pressable>

        <Image
          source={userData.profilePhoto || require("@/assets/images/user.jpg")}
          style={{
            display: "none",
            height: 150,
            width: 150,
            borderRadius: 75,
          }}
          transition={100}
        />

        <View
          id="fullname-verified"
          style={{
            marginTop: 5,
            flexDirection: "row",
            gap: 5,
            alignItems: "center",
            width: "100%",
            justifyContent: "center",
          }}
        >
          <Text
            bold
            style={{
              fontSize: 25,
              textAlign: "center",
            }}
          >
            {userData.fullname}
          </Text>
          {userData.verified && (
            <MaterialIcons name="verified" size={25} color={apidonPink} />
          )}
        </View>

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
              width: "25%",
            }}
          >
            <Text
              style={{
                fontSize: 15,
                textAlign: "center",
                color: "white",
              }}
              bold
            >
              {collsCount}
            </Text>
            <Text
              style={{
                color: "white",
                fontSize: 15,
                textAlign: "center",
              }}
            >
              Colls
            </Text>
          </View>

          <View
            style={{
              width: "25%",
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
              width: "25%",
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
                textAlign: "center",
              }}
              fontSize={12}
              bold
            >
              Edit Profile
            </Text>
          </Pressable>
        ) : (
          <FollowButton username={userData.username} />
        )}
      </View>

      <CustomBottomModalSheet
        ref={userSettingsBottomModalRef}
        backgroundColor="#1B1B1B"
      >
        <UserSettingsBottomSheetModalContent
          modalRef={userSettingsBottomModalRef}
          userData={userData}
          isOwnPage={userOwnsPage}
        />
      </CustomBottomModalSheet>
    </>
  );
};

export default Header;
