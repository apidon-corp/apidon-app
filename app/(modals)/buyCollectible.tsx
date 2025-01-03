import { Text } from "@/components/Text/Text";
import {
  ActivityIndicator,
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

import CustomBottomModalSheet from "@/components/BottomSheet/CustomBottomModalSheet";
import { CollectibleDocData } from "@/types/Collectible";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { UserIdentityDoc } from "@/types/Identity";

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

  const buyButtonOpacityValue = useRef(new Animated.Value(0.5)).current;

  const buyCollectilbeWarningModal = useRef<BottomSheetModal>(null);

  const [identityDocData, setIdentityDocData] =
    useState<UserIdentityDoc | null>(null);

  // Getting collectible data.
  useEffect(() => {
    getInitialData();
  }, [postDocPath]);

  // Balance Status Setting
  useEffect(() => {
    if (!collectibleData) return;
    if (collectibleData.type !== "trade") return;

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
    let identityStatus = false;

    if (identityDocData) identityStatus = identityDocData.status === "verified";

    handleChangeOpactiy(
      buyButtonOpacityValue,
      balanceStatus === "enough" && identityStatus && !loading ? 1 : 0.5,
      500
    );
  }, [balanceStatus, loading, identityDocData]);

  // Get realtime verification status of user.
  useEffect(() => {
    const displayName = auth().currentUser?.displayName;
    if (!displayName) return;

    const unsubscribe = firestore()
      .doc(`users/${displayName}/personal/identity`)
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) {
            console.error("Identity doc can not be fetched.");
            return setIdentityDocData(null);
          }
          setIdentityDocData(snapshot.data() as UserIdentityDoc);
        },
        (error) => {
          console.error("Error on getting identity doc ", error);
          setIdentityDocData(null);
        }
      );

    return () => unsubscribe();
  }, []);

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

      const collectibleDataFetched =
        collectibleDocSnapshot.data() as CollectibleDocData;
      return collectibleDataFetched;
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

    if (buyCollectilbeWarningModal.current)
      buyCollectilbeWarningModal.current.present();
  };

  const handleConfirmButton = async () => {
    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return console.error("No user");

    if (!postDocPath) return;

    if (balanceStatus !== "enough") return;

    if (!identityDocData || identityDocData.status !== "verified") return;

    const username = currentUserAuthObject.displayName;
    if (!username) return;

    if (loading) return;

    setLoading(true);

    try {
      const idToken = await currentUserAuthObject.getIdToken();
      const { token: appchecktoken } = await appCheck().getLimitedUseToken();

      const response = await fetch(
        apiRoutes.collectible.tradeBased.buyCollectible,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${idToken}`,
            appchecktoken,
          },
          body: JSON.stringify({
            postDocPath,
          }),
        }
      );

      if (!response.ok) {
        console.error(
          "Resonse from buy collectible API is not okay: ",
          await response.text()
        );
        return setLoading(false);
      }

      // Good to go...
      buyCollectilbeWarningModal.current?.dismiss();

      router.dismiss();

      setScreenParameters([
        { queryId: "collectedNFTPostDocPath", value: postDocPath },
      ]);
      router.push(`/home/feed/profilePage?username=${username}`);

      return setLoading(false);
    } catch (error) {
      console.error("Error on buying collectible ", error);
      return setLoading(false);
    }
  };

  const handleCancelButton = () => {
    buyCollectilbeWarningModal.current?.dismiss();
  };

  const handlePressBalanceArea = () => {
    router.push("/(modals)/wallet");
  };

  const handlePressCreatorInformation = () => {
    if (!creatorData) return;

    router.push(`/(modals)/profilePage?username=${creatorData.username}`);
  };

  const handlePressVerifyIdentity = () => {
    router.push("/(modals)/identity");
  };

  if (!postDocPath) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Post doc path not found</Text>
      </View>
    );
  }

  if (!postData || !collectibleData || !creatorData || !identityDocData) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="white" />
      </View>
    );
  }

  if (collectibleData.type !== "trade")
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text fontSize={13} style={{ textAlign: "center" }}>
          This collectible is non-tradable, meaning it can only be obtained by
          entering a special code on the main screen.
        </Text>
      </View>
    );

  return (
    <>
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
              <View
                id="fullname-verified"
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <Text
                  style={{
                    color: "white",
                  }}
                >
                  {creatorData.fullname}
                </Text>
                {creatorData.verified && (
                  <MaterialIcons name="verified" size={14} color={apidonPink} />
                )}
              </View>

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

        {identityDocData.status !== "verified" && (
          <Pressable
            onPress={handlePressVerifyIdentity}
            id="verification-info"
            style={{
              backgroundColor: "rgba(255,255,255,0.075)",
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
              borderRadius: 20,
              padding: 15,
              flexDirection: "row",
            }}
          >
            <Text
              fontSize={12}
              style={{
                color: "yellow",
                textDecorationLine: "underline",
              }}
            >
              You need to verify yourself to purchase collectibles.
            </Text>
            <AntDesign name="arrowright" size={18} color="yellow" />
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
              balanceStatus !== "enough" ||
              loading ||
              identityDocData.status !== "verified"
            }
            onPress={handleBuyButton}
            style={{
              width: "50%",
              opacity: loading ? 1 : balanceStatus !== "enough" ? 0.5 : 1,
              backgroundColor: apidonPink,
              height: 40,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text
                bold
                style={{
                  color: "white",
                }}
              >
                Buy for ${collectibleData.price.price}
              </Text>
            )}
          </Pressable>
        </Animated.View>
      </ScrollView>

      <BottomSheetModalProvider>
        <CustomBottomModalSheet
          ref={buyCollectilbeWarningModal}
          backgroundColor="#1B1B1B"
        >
          <View style={{ flex: 1, gap: 15, padding: 10 }}>
            <Text fontSize={18} bold>
              Confirm Your Purhcase
            </Text>
            <Text fontSize={13}>
              You are about to purchase a digital collectible item for $
              {collectibleData.price.price}.
            </Text>
            <Text fontSize={13}>
              Please note that this purchase is final and non-refundable. Once
              the transaction is completed, the digital item will be added to
              your collection, and no refunds will be issued.
            </Text>
            <Text fontSize={13}>Review and confirm your purchase.</Text>
            <Pressable
              onPress={handleConfirmButton}
              style={{
                backgroundColor: "white",
                height: 40,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {loading ? (
                <ActivityIndicator color="black" size="small" />
              ) : (
                <Text style={{ color: "black" }}>Confirm</Text>
              )}
            </Pressable>
            <Pressable
              disabled={loading}
              onPress={handleCancelButton}
              style={{
                borderWidth: 1,
                borderColor: "white",
                height: 40,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text>Cancel</Text>
            </Pressable>
          </View>
        </CustomBottomModalSheet>
      </BottomSheetModalProvider>
    </>
  );
};

export default buyNFT;
