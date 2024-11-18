import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import Text from "@/components/Text/Text";
import { apidonPink } from "@/constants/Colors";
import { AntDesign, Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";

import * as Clipboard from "expo-clipboard";

import { UserInServer } from "@/types/User";

import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { UserIdentityDoc } from "@/types/Identity";
import { router, usePathname } from "expo-router";

const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const GetPinkTickScreenComponent = () => {
  const [userData, setUserData] = useState<UserInServer | null>(null);

  const pathname = usePathname();

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const displayName = auth().currentUser?.displayName || "";
    if (!displayName) return setUserData(null);

    const unsubscribe = firestore()
      .doc(`users/${displayName}`)
      .onSnapshot(
        (snapshot) => {
          if (snapshot.exists) {
            setUserData(snapshot.data() as UserInServer);
          } else {
            setUserData(null);
          }
        },
        (error) => {
          console.error("Error on getting realtime data: ", error);
          return setUserData(null);
        }
      );

    return () => unsubscribe();
  }, []);

  const handleCopyButton = async () => {
    const uid = auth().currentUser?.uid || "";
    Clipboard.setStringAsync(uid);
    setCopied(true);
    await delay(2000);
    setCopied(false);
  };

  const handlePressIdentityVerification = () => {
    const path = pathname;
    const subScreens = path.split("/");

    const length = subScreens.length;

    subScreens[length - 1] = "identity";

    const dest = subScreens.join("/");

    router.push(dest);
  };

  if (!userData) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="small" />
      </SafeAreaView>
    );
  }

  if (!userData.verified) {
    return (
      <View
        style={{
          width: "100%",
          flex: 1,
          paddingHorizontal: 15,
          gap: 20,
          justifyContent: "center",
        }}
      >
        <View
          id="header"
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <MaterialIcons name="verified" size={64} color={apidonPink} />
          <Text fontSize={18} style={{ textAlign: "center" }} bold>
            Become a verified creator on Apidon!
          </Text>
        </View>

        <View
          id="steps-root"
          style={{
            gap: 20,
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Text
            bold
            style={{
              textDecorationLine: "underline",
            }}
          >
            Steps You Need To Take
          </Text>

          <View
            id="steps-elements"
            style={{
              gap: 15,
              width: "100%",
            }}
          >
            <View
              id="ig-step-area"
              style={{
                width: "100%",
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: 15,
                padding: 10,
              }}
            >
              <View
                style={{
                  width: "5%",
                }}
              >
                <Entypo name="dot-single" size={24} color="white" />
              </View>

              <View
                style={{
                  width: "5%",
                }}
              />

              <View
                style={{
                  width: "85%",
                }}
              >
                <Text fontSize={13}>
                  Direct message to Apidon's official Instagram account
                  (@apidon_com) with your unique UID. You can easily copy your
                  UID using the button below.
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Pressable
          disabled={copied}
          onPress={handleCopyButton}
          style={{
            backgroundColor: "white",
            padding: 10,
            borderRadius: 15,
            marginTop: 5,
            width: "75%",
            alignSelf: "center",
          }}
        >
          <Text
            bold
            fontSize={12}
            style={{ textAlign: "center", color: "black" }}
          >
            {copied ? "Copied!" : "Copy UID"}
          </Text>
        </Pressable>
      </View>
    );
  }

  if (userData.verified) {
    return (
      <View
        style={{
          padding: 15,
          gap: 15,
          width: "100%",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <MaterialIcons name="verified" size={64} color={apidonPink} />
        <Text fontSize={16} style={{ textAlign: "center" }} bold>
          You are a verified creator on Apidon!
        </Text>
        <Text fontSize={13} style={{ textAlign: "center" }}>
          Congratulations! You now have access to all the features of our app as
          a creator. Thank you for being a part of our community!
        </Text>
      </View>
    );
  }
};

export default GetPinkTickScreenComponent;
