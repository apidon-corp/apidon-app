import { Text } from "@/components/Text/Text";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import React, { useEffect, useState } from "react";

import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import { apidonPink } from "@/constants/Colors";
import { PostServerData } from "@/types/Post";
import { UserInServer } from "@/types/User";
import { MaterialIcons } from "@expo/vector-icons";
import firestore from "@react-native-firebase/firestore";
import { Image } from "expo-image";
import { useAtom } from "jotai";

import appCheck from "@react-native-firebase/app-check";
import auth from "@react-native-firebase/auth";

import apiRoutes from "@/helpers/ApiRoutes";
import { useBalance } from "@/hooks/useBalance";

import { CollectibleDocData } from "@/types/Collectible";
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

  useEffect(() => {
    getInitialData();
  }, [postDocPath]);

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
      "Buy NFT",
      `Are you sure you want to buy this NFT for $${collectibleData.price.price}?`,
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

  const handleTopUpButton = () => {
    router.push("/(modals)/wallet");
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

  let balanceStatus: "loading" | "error" | "enough" | "not-enough" =
    balance === "error"
      ? "error"
      : balance === "getting-balance"
      ? "loading"
      : balance >= collectibleData.price.price
      ? "enough"
      : "not-enough";

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        padding: 10,
        gap: 10,
      }}
    >
      <View
        style={{
          width: "75%",
        }}
      >
        <Image
          source={postData.image}
          style={{
            width: "100%",
            aspectRatio: 1,
            borderRadius: 10,
          }}
        />
      </View>
      <View
        id="price"
        style={{
          width: "100%",
          borderWidth: 1,
          borderColor: "#808080",
          borderRadius: 10,
          padding: 10,
          gap: 5,
        }}
      >
        <Text fontSize={18} bold>
          Price
        </Text>
        <Text
          bold
          style={{
            color: "#808080",
          }}
        >
          ${collectibleData.price.price}
        </Text>
      </View>
      <View
        id="creator-information"
        style={{
          width: "100%",
          flexDirection: "row",
          borderWidth: 1,
          borderColor: "#808080",
          borderRadius: 10,
          padding: 10,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View
          id="text-based-information"
          style={{
            gap: 5,
          }}
        >
          <Text fontSize={18} bold>
            Creator
          </Text>
          <View style={{ flexDirection: "row", gap: 5 }}>
            <View>
              <Text
                bold
                style={{
                  color: "#808080",
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
                {creatorData.username}
              </Text>
            </View>
            <View id="verified-badge">
              <MaterialIcons name="verified" size={18} color={apidonPink} />
            </View>
          </View>
        </View>
        <View>
          <Image
            source={creatorData.profilePhoto}
            style={{ width: 80, aspectRatio: 1, borderRadius: 40 }}
          />
        </View>
      </View>

      <View id="balance">
        <Text bold>Your balance</Text>
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
      <View id="buy-button" style={{ width: "100%" }}>
        <Pressable
          disabled={loading || balanceStatus !== "enough"}
          onPress={handleBuyButton}
          style={{
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
                fontSize: 18,
              }}
            >
              Buy for ${collectibleData.price.price}
            </Text>
          )}
        </Pressable>
      </View>
      {balanceStatus === "not-enough" && !loading && (
        <Pressable
          onPress={handleTopUpButton}
          id="top-up"
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            bold
            style={{
              color: "red",
              fontSize: 14,
              textDecorationLine: "underline",
            }}
          >
            Not enough balance? Top Up!
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
};

export default buyNFT;
