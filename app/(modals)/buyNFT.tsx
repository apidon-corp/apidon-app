import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { Text } from "@/components/Text/Text";
import React, { useEffect, useState } from "react";
import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import { useAtomValue } from "jotai";
import { NftDocDataInServer } from "@/types/Nft";
import { PostServerData } from "@/types/Post";
import firestore from "@react-native-firebase/firestore";
import { Image } from "expo-image";
import { UserInServer } from "@/types/User";
import { MaterialIcons } from "@expo/vector-icons";
import { apidonPink } from "@/constants/Colors";

import auth from "@react-native-firebase/auth";
import appCheck from "@react-native-firebase/app-check";
import apiRoutes from "@/helpers/ApiRoutes";
import { useStripe } from "@stripe/stripe-react-native";
import { router } from "expo-router";

const buyNFT = () => {
  const screenParameters = useAtomValue(screenParametersAtom);
  const postDocPath = screenParameters.find(
    (q) => q.queryId === "postDocPath"
  )?.value;

  const [postData, setPostData] = useState<PostServerData | null>(null);
  const [nftData, setNftData] = useState<NftDocDataInServer | null>(null);
  const [creatorData, setCreatorData] = useState<UserInServer | null>(null);

  const [loading, setLoading] = useState(false);

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  useEffect(() => {
    getInitialData();
  }, [postDocPath]);

  const getInitialData = async () => {
    if (!postDocPath) return;

    const postDataFetched = await getPostData(postDocPath);
    if (!postDataFetched) return setPostData(null);

    setPostData(postDataFetched);

    if (
      !postDataFetched.nftStatus.convertedToNft ||
      !postDataFetched.nftStatus.nftDocPath
    )
      return console.error("Post not converted to NFT yet.");

    const nftDocDataFetched = await getNftData(
      postDataFetched.nftStatus.nftDocPath
    );
    if (!nftDocDataFetched) return setNftData(null);
    setNftData(nftDocDataFetched);

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

  const getNftData = async (nftDocPath: string) => {
    try {
      const nftDocSnapshot = await firestore().doc(nftDocPath).get();
      if (!nftDocSnapshot.exists) {
        console.error("NFT's realtime data can not be fecthed.");
        return false;
      }

      const nftDataFetched = nftDocSnapshot.data() as NftDocDataInServer;
      return nftDataFetched;
    } catch (error) {
      console.error("Error on getting inital data of NFT ", error);
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
    if (!nftData?.listStatus.isListed) return;

    Alert.alert(
      "Buy this NFT?",
      `This NFT costs $${nftData.listStatus.price.price}`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        { text: "Buy", onPress: handleBuy },
      ],
      { cancelable: false }
    );
  };

  const handleBuy = async () => {
    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return console.error("No user");
    if (!postDocPath) return;

    if (loading) return;

    setLoading(true);

    try {
      const { token: appchecktoken } = await appCheck().getLimitedUseToken();
      const idToken = await currentUserAuthObject.getIdToken();

      const response = await fetch(apiRoutes.nft.buyNFT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
          appchecktoken,
        },
        body: JSON.stringify({
          postDocPath: postDocPath,
        }),
      });

      if (!response.ok) {
        console.error(
          "Response from buyNFT API is not okay: ",
          await response.text()
        );
        return setLoading(false);
      }

      const { paymentIntent, ephemeralKey, customer } = await response.json();

      const { error } = await initPaymentSheet({
        merchantDisplayName: "Apidon Corp",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        defaultBillingDetails: {
          name: "Kendall Roy",
        },
        returnURL: "apidon://home",
      });

      if (error) {
        console.error("Error from stripe initPaymentSheet: ", error);
        return setLoading(false);
      }

      const { error: presentError } = await presentPaymentSheet();
      if (error) {
        console.error("Error from stripe presentPaymentSheet: ", presentError);
        return setLoading(false);
      }

      console.log("All Operations are successfull.");

      router.dismiss();

      router.push(`/home/profile/${currentUserAuthObject.displayName}`);

      return setLoading(false);
    } catch (error) {
      console.error("Error on buy process: ", error);
      setLoading(false);
    }
  };

  if (!postDocPath) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Post doc path not found</Text>
      </View>
    );
  }

  if (!postData || !nftData || !creatorData) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="white" />
      </View>
    );
  }

  if (!nftData.listStatus.isListed) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>This NFT is not listed yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        padding: 10,
        gap: 10,
        alignItems: "center",
        justifyContent: "center",
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
          ${nftData.listStatus.price.price}
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
      <View id="buy-button" style={{ width: "100%" }}>
        <Pressable
          disabled={loading}
          onPress={handleBuyButton}
          style={{
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
              Buy for ${nftData.listStatus.price.price}
            </Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default buyNFT;
