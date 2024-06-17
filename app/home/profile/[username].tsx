import { firestore } from "@/firebase/client";
import { UserInServer } from "@/types/User";
import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  Switch,
  View,
} from "react-native";

import { Text } from "@/components/Text/Text";
import { apidonPink } from "@/constants/Colors";

type Props = {};

const profile = (props: Props) => {
  const { username } = useLocalSearchParams<{ username: string }>();

  const [loading, setLoading] = useState(false);

  const [userData, setUserData] = useState<UserInServer | null>(null);

  const [toggleValue, setToggleValue] = useState<"posts" | "frenlets">("posts");

  useEffect(() => {
    if (username) handleGetProfileData();
  }, [username]);

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

  const onToggleValueChange = () => {
    setToggleValue((prev) => (prev === "posts" ? "frenlets" : "posts"));
  };

  const handleEditProfileButton = () => {
    if (!userData) return;

    const encodedImage = encodeURI(userData.profilePhoto);
    const encodedFullname = encodeURI(userData.fullname);

    router.push(
      `/home/profile/editProfile?image=${encodedImage}&fullname=${encodedFullname}`
    );
  };

  if (!userData)
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="white" />
      </SafeAreaView>
    );

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <View
        style={{
          flex: 1,
          padding: 10,
          alignItems: "center",
          gap: 5,
        }}
      >
        <Image
          source={{
            uri: userData.profilePhoto,
          }}
          style={{
            height: 150,
            aspectRatio: 1,
            borderRadius: 75,
          }}
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
              width: "25%",
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
              gap: 4,
              width: "25%",
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
          </View>
          <View
            style={{
              gap: 4,
              width: "25%",
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
          </View>
        </View>
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
        <View
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 10,
            marginTop: 15,
          }}
        >
          <Text
            style={{
              fontSize: 14,
            }}
          >
            Posts
          </Text>
          <Switch
            trackColor={{ false: apidonPink, true: apidonPink }}
            ios_backgroundColor={apidonPink}
            thumbColor="black"
            onValueChange={onToggleValueChange}
            value={toggleValue === "posts" ? false : true}
          />
          <Text
            style={{
              fontSize: 14,
            }}
          >
            Frens
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default profile;
