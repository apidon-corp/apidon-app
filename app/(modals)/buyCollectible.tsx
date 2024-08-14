import { Text } from "@/components/Text/Text";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import React, { useEffect, useRef, useState } from "react";

import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import { apidonPink } from "@/constants/Colors";
import { PostServerData } from "@/types/Post";
import { UserInServer } from "@/types/User";
import firestore from "@react-native-firebase/firestore";
import { Image } from "expo-image";
import { useAtom } from "jotai";

import appCheck from "@react-native-firebase/app-check";
import auth from "@react-native-firebase/auth";

import apiRoutes from "@/helpers/ApiRoutes";
import { useBalance } from "@/hooks/useBalance";

import { useAuth } from "@/providers/AuthProvider";
import { CollectibleDocData } from "@/types/Collectible";
import { UserIdentityDoc } from "@/types/Identity";
import { router } from "expo-router";

const buyNFT = () => {
  const [screenParameters, setScreenParameters] = useAtom(screenParametersAtom);
  const postDocPath = screenParameters.find((q) => q.queryId === "postDocPath")
    ?.value as string;

  const [postData, setPostData] = useState<PostServerData | null>(null);
  const [collectibleData, setCollectibleData] =
    useState<CollectibleDocData | null>(null);
  const [creatorData, setCreatorData] = useState<UserInServer | null>(null);

  const [loading, setLoading] = useState(false);

  const { balance } = useBalance();

  const [balanceStatus, setBalanceStatus] = useState<
    "loading" | "error" | "enough" | "not-enough"
  >("loading");

  const { authStatus } = useAuth();

  const [isIdentityVerified, setIsIdentityVerified] = useState(false);

  const buyButtonOpacityValue = useRef(new Animated.Value(0.5)).current;

  // Getting collectible data.
  useEffect(() => {
    getInitialData();
  }, [postDocPath]);

  // Checking identity verification status - realtime.
  useEffect(() => {
    if (authStatus !== "authenticated") return;

    const currentUserDisplayname = auth().currentUser?.displayName || "";
    if (!currentUserDisplayname) return;

    const unsubscribe = firestore()
      .doc(`users/${currentUserDisplayname}/personal/identity`)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            const data = doc.data() as UserIdentityDoc;

            if (data.status === "verified") {
              setIsIdentityVerified(true);
            } else {
              setIsIdentityVerified(false);
            }
          } else {
            setIsIdentityVerified(false);
          }
        },
        (error) => {
          console.error("Error fetching identity data:", error);
          setIsIdentityVerified(false);
        }
      );

    () => unsubscribe();
  }, [authStatus]);

  // Balance Status Setting
  useEffect(() => {
    if (!collectibleData) return;

    const balanceStatusResult =
      balance === "error"
        ? "error"
        : balance === "getting-balance"
        ? "loading"
        : balance >= collectibleData.price.price
        ? "enough"
        : "not-enough";

    setBalanceStatus(balanceStatusResult);
  }, [collectibleData, balance]);

  // Managing opacity of buy button
  useEffect(() => {
    handleChangeOpactiy(
      buyButtonOpacityValue,
      isIdentityVerified && balanceStatus === "enough" && !loading ? 1 : 0.5,
      500
    );
  }, [isIdentityVerified, balanceStatus, loading]);

  const handleChangeOpactiy = (
    animatedObject: Animated.Value,
    toValue: number,
    duration: number
  ) => {
    Animated.timing(animatedObject, {
      toValue,
      duration,
      useNativeDriver: true,
    }).start();
  };

  const getInitialData = async () => {
    if (!postDocPath) return;

    const postDataFetched = await getPostData(postDocPath);
    if (!postDataFetched) return setPostData(null);

    setPostData(postDataFetched);

    if (!postDataFetched.collectibleStatus.isCollectible)
      return console.error("Post not converted to collectible yet.");

    const collectibleDocDataFetched = await getCollectibleDocData(
      postDataFetched.collectibleStatus.collectibleDocPath
    );
    if (!collectibleDocDataFetched) return setCollectibleData(null);
    setCollectibleData(collectibleDocDataFetched);

    const creatorDataFetched = await getCreatorData(
      postDataFetched.senderUsername
    );
    if (!creatorDataFetched) return setCreatorData(null);
    setCreatorData(creatorDataFetched);
  };

  const getPostData = async (postDocPath: string) => {
    try {
      const postDataSnapshot = await firestore().doc(postDocPath).get();
      if (!postDataSnapshot.exists) {
        console.error("Post's realtime data can not be fecthed.");
        return false;
      }

      const postDataFetched = postDataSnapshot.data() as PostServerData;

      return postDataFetched;
    } catch (error) {
      console.error("Error on getting inital data of post ", error);
      return false;
    }
  };

  const getCollectibleDocData = async (collectibleDocPath: string) => {
    try {
      const collectibleDocSnapshot = await firestore()
        .doc(collectibleDocPath)
        .get();
      if (!collectibleDocSnapshot.exists) {
        console.error("Collectible's data can not be fecthed.");
        return false;
      }

      const nftDataFetched =
        collectibleDocSnapshot.data() as CollectibleDocData;
      return nftDataFetched;
    } catch (error) {
      console.error("Error on getting inital data of collectible ", error);
      return false;
    }
  };

  const getCreatorData = async (creatorUsername: string) => {
    try {
      const creatorDocSnapshot = await firestore()
        .collection("users")
        .doc(creatorUsername)
        .get();
      if (!creatorDocSnapshot.exists) {
        console.error("Creator's realtime data can not be fecthed.");
        return false;
      }

      const creatorDataFetched = creatorDocSnapshot.data() as UserInServer;
      return creatorDataFetched;
    } catch (error) {
      console.error("Error on getting inital data of creator ", error);
      return false;
    }
  };

  const handleBuyButton = () => {
    if (!collectibleData) return;

    Alert.alert(
      "Buy Collectible",
      `Are you sure you want to buy this collectible for $${collectibleData.price.price}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Buy",
          onPress: handleBuy,
        },
      ]
    );
  };

  const handleBuy = async () => {
    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return console.error("No user");

    if (!postDocPath) return;

    if (balanceStatus !== "enough") return;
    if (!isIdentityVerified) return;

    if (loading) return;

    setLoading(true);

    try {
      const idToken = await currentUserAuthObject.getIdToken();
      const { token: appchecktoken } = await appCheck().getLimitedUseToken();

      const response = await fetch(apiRoutes.collectible.buyCollectible, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
          appchecktoken,
        },
        body: JSON.stringify({
          postDocPath,
        }),
      });

      if (!response.ok) {
        console.error(
          "Resonse from buy collectible API is not okay: ",
          await response.text()
        );
        return setLoading(false);
      }

      // Good to go...
      setLoading(false);
      setScreenParameters([
        { queryId: "collectedNFTPostDocPath", value: postDocPath },
      ]);
      router.dismiss();
      return router.push(`/home/profile/${currentUserAuthObject.displayName}`);
    } catch (error) {
      console.error("Error on buying NFT ", error);
      return setLoading(false);
    }
  };

  const handlePressBalanceArea = () => {
    router.push("/(modals)/wallet");
  };

  const handleVerifyIdentityButton = () => {
    router.push("/(modals)/identity");
  };

  const handlePressCreatorInformation = () => {
    if (!creatorData) return;

    router.push(`/(modals)/profilePage?username=${creatorData.username}`);
  };

  if (!postDocPath) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Post doc path not found</Text>
      </View>
    );
  }

  if (!postData || !collectibleData || !creatorData) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="white" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        padding: 15,
        gap: 15,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View
        id="image-area"
        style={{
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={postData.image}
          style={{
            width: "80%",
            aspectRatio: 1,
            borderRadius: 15,
          }}
        />
      </View>

      <Pressable
        onPress={handlePressCreatorInformation}
        id="creator-area"
        style={{
          width: "100%",
          backgroundColor: "rgba(255,255,255,0.05)",
          padding: 15,
          borderRadius: 20,
          flexDirection: "row",
        }}
      >
        <View
          id="creator-username-fullname"
          style={{
            width: "80%",
            gap: 5,
          }}
        >
          <Text fontSize={18} bold>
            Creator
          </Text>

          <View id="username-fullname">
            <Text
              style={{
                color: "white",
              }}
            >
              {creatorData.fullname}
            </Text>
            <Text
              fontSize={12}
              style={{
                color: "#808080",
              }}
            >
              @{creatorData.username}
            </Text>
          </View>
        </View>
        <View
          style={{
            width: "20%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={
              creatorData.profilePhoto || require("@/assets/images/user.jpg")
            }
            style={{
              width: "100%",
              aspectRatio: 1,
              borderRadius: 100,
            }}
          />
        </View>
      </Pressable>

      <Pressable
        onPress={handlePressBalanceArea}
        id="balance"
        style={{
          width: "100%",
          flexDirection: "row",
          padding: 15,
          backgroundColor: "rgba(255,255,255,0.05)",
          borderRadius: 20,
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "80%",
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Text bold>Your balance: </Text>
          {balanceStatus === "loading" || balanceStatus === "error" ? (
            <ActivityIndicator />
          ) : (
            <Text
              bold
              style={{
                color: "#808080",
              }}
            >
              ${balance}
            </Text>
          )}
        </View>
        <View
          id="top-up-area"
          style={{
            display: balanceStatus === "not-enough" ? undefined : "none",
            width: "20%",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <Text
            bold
            style={{ color: "green", textDecorationLine: "underline" }}
          >
            Top Up
          </Text>
        </View>
      </Pressable>

      {!isIdentityVerified && (
        <Pressable
          onPress={handleVerifyIdentityButton}
          style={{
            width: "100%",
            padding: 15,
            backgroundColor: "rgba(255,255,255,0.05)",
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            bold
            style={{
              textAlign: "center",
              textDecorationLine: "underline",
              color: "yellow",
              opacity: 0.75,
            }}
          >
            Verify yourself to collect this item.
          </Text>
        </Pressable>
      )}

      <Animated.View
        id="buy-button"
        style={{
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          opacity: buyButtonOpacityValue,
        }}
      >
        <Pressable
          disabled={
            balanceStatus !== "enough" || !isIdentityVerified || loading
          }
          onPress={handleBuyButton}
          style={{
            width: "50%",
            opacity: loading ? 1 : balanceStatus !== "enough" ? 0.5 : 1,
            backgroundColor: apidonPink,
            padding: 10,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text
              bold
              style={{
                color: "white",
                fontSize: 15,
              }}
            >
              Buy for ${collectibleData.price.price}
            </Text>
          )}
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
};

export default buyNFT;
