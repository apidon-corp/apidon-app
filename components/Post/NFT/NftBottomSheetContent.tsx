import { Text } from "@/components/Text/Text";
import { apidonPink } from "@/constants/Colors";
import { PostServerData } from "@/types/Post";
import { UserInServer } from "@/types/User";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import { useAuth } from "@/providers/AuthProvider";
import { NftDocDataInServer } from "@/types/Nft";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { router } from "expo-router";
import { useSetAtom } from "jotai";

type Props = {
  postData: PostServerData;
  postSenderData: UserInServer;
  closeNFTBottomSheet: () => void;
};

type NftStatus =
  | "not-converted-to-nft"
  | {
      isListed: true;
      fromCurrentUser: boolean;
      price: number;
      currency: string;
      stock: number;
      totalStock: number;
      alreadyBought: boolean;
    }
  | { isListed: false; fromCurrentUser: boolean }
  | null;

const NftBottomSheetContent = ({
  postData,
  postSenderData,
  closeNFTBottomSheet,
}: Props) => {
  const {authStatus} = useAuth();

  const [nftDocData, setNftDocData] = useState<NftDocDataInServer | null>(null);
  const [nftStatus, setNftStatus] = useState<NftStatus>(null);

  const setScreenParameters = useSetAtom(screenParametersAtom);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    if (!postData.nftStatus.convertedToNft) return;
    if (!postData.nftStatus.nftDocPath) return;

    const unsubscribe = firestore()
      .doc(postData.nftStatus.nftDocPath)
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) {
            console.error(
              "NFT doc does not exist: ",
              postData.nftStatus.nftDocPath
            );
            return setNftDocData(null);
          }

          const nftDocDataFetched = snapshot.data() as NftDocDataInServer;

          return setNftDocData(nftDocDataFetched);
        },
        (error) => {
          console.error(
            "Error on getting realtime nft data at: \n",
            postData.nftStatus.nftDocPath,
            "\n",
            error
          );
          return setNftDocData(null);
        }
      );
    () => unsubscribe();
  }, [authStatus]);

  useEffect(() => {
    if (!nftDocData) return setNftStatus(null);

    const currentUserDisplayName = auth().currentUser?.displayName;
    if (!currentUserDisplayName) return setNftStatus(null);

    if (nftDocData) {
      if (nftDocData.listStatus.isListed) {
        let alreadyBoughtStatus = true;

        if (nftDocData.listStatus.buyers) {
          const buyersUsername = nftDocData.listStatus.buyers.map(
            (b) => b.username
          );
          alreadyBoughtStatus = buyersUsername.includes(currentUserDisplayName);
        } else {
          alreadyBoughtStatus = false;
        }

        const { price, stock } = nftDocData.listStatus;

        setNftStatus({
          isListed: true,
          alreadyBought: alreadyBoughtStatus,
          currency: price.currency,
          fromCurrentUser: postData.senderUsername === currentUserDisplayName,
          price: price.price,
          stock: stock.remainingStock,
          totalStock: stock.initialStock,
        });
      } else {
        setNftStatus({
          isListed: false,
          fromCurrentUser: postData.senderUsername === currentUserDisplayName,
        });
      }
    } else {
      setNftStatus("not-converted-to-nft");
    }
  }, [nftDocData]);

  const handleSetPriceButton = () => {
    setScreenParameters([
      {
        queryId: "postDocPath",
        value: `users/${postSenderData.username}/posts/${postData.id}`,
      },
    ]);

    return router.push("/(modals)/listNFT");
  };

  const handleCollectButton = () => {
    closeNFTBottomSheet();

    setScreenParameters([
      {
        queryId: "postDocPath",
        value: `users/${postSenderData.username}/posts/${postData.id}`,
      },
    ]);

    router.push("/(modals)/buyNFT");
  };

  const handleSeeCollectors = () => {
    setScreenParameters([
      {
        queryId: "postDocPath",
        value: `users/${postSenderData.username}/posts/${postData.id}`,
      },
    ]);

    router.push("/(modals)/collectors");
  };

  if (!nftStatus) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="white" />
      </View>
    );
  }

  if (nftStatus === "not-converted-to-nft") {
    return <Text>Not converted to NFT</Text>;
  }

  return (
    <View
      style={{
        flex: 1,
        gap: 10,
      }}
    >
      <View
        id="creator-information"
        style={{
          flexDirection: "row",
          backgroundColor: "#323232",
          padding: 20,
          justifyContent: "space-between",
          borderRadius: 10,
        }}
      >
        <View
          style={{
            justifyContent: "space-between",
          }}
        >
          <Text
            bold
            style={{
              fontSize: 18,
            }}
          >
            Creator
          </Text>
          <View id="username-fullaname">
            <Text
              bold
              style={{
                fontSize: 14,
              }}
            >
              {postData.senderUsername}
            </Text>
            <Text
              style={{
                fontSize: 14,
              }}
            >
              {postSenderData.fullname}
            </Text>
          </View>
          <Text
            bold
            style={{
              fontSize: 14,
              color: apidonPink,
            }}
          >
            {postSenderData.nftCount} NFTs
          </Text>
        </View>
        <View>
          <Image
            source={
              postSenderData.profilePhoto || require("@/assets/images/user.jpg")
            }
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
            }}
            transition={500}
          />
        </View>
      </View>

      {nftStatus.isListed && (
        <View
          id="price-stock"
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <View
            id="price"
            style={{
              flex: 0.5,
              flexDirection: "row",
              backgroundColor: "#323232",
              padding: 20,
              gap: 5,
              borderRadius: 10,
              justifyContent: "space-between",
            }}
          >
            <Text
              bold
              style={{
                fontSize: 18,
              }}
            >
              Price
            </Text>
            <Text
              bold
              style={{
                fontSize: 18,
                color: apidonPink,
              }}
            >
              ${nftStatus.price}
            </Text>
          </View>
          <View
            id="stock"
            style={{
              flex: 0.5,
              flexDirection: "row",
              backgroundColor: "#323232",
              padding: 20,
              gap: 5,
              borderRadius: 10,
              justifyContent: "space-between",
            }}
          >
            <Text
              bold
              style={{
                fontSize: 18,
              }}
            >
              Stock
            </Text>
            <Text
              bold
              style={{
                fontSize: 18,
                color: apidonPink,
              }}
            >
              {nftStatus.stock} Left
            </Text>
          </View>
        </View>
      )}

      {!nftStatus.isListed && nftStatus.fromCurrentUser && (
        <Pressable
          onPress={handleSetPriceButton}
          style={{
            backgroundColor: apidonPink,
            padding: 20,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            bold
            style={{
              color: "white",
              fontSize: 18,
            }}
          >
            Set Price
          </Text>
        </Pressable>
      )}

      {!nftStatus.isListed && !nftStatus.fromCurrentUser && (
        <Pressable
          style={{
            opacity: 0.5,
            backgroundColor: apidonPink,
            padding: 20,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            bold
            style={{
              color: "white",
              fontSize: 18,
            }}
          >
            Not Listed
          </Text>
        </Pressable>
      )}

      {nftStatus.isListed && nftStatus.fromCurrentUser && (
        <Pressable
          onPress={handleSeeCollectors}
          style={{
            backgroundColor: apidonPink,
            padding: 20,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            bold
            style={{
              color: "white",
              fontSize: 18,
            }}
          >
            See Collectors
          </Text>
        </Pressable>
      )}

      {nftStatus.isListed &&
        !nftStatus.fromCurrentUser &&
        nftStatus.alreadyBought && (
          <Pressable
            style={{
              backgroundColor: apidonPink,
              opacity: 0.5,
              padding: 20,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              bold
              style={{
                color: "white",
                fontSize: 18,
              }}
            >
              Collected
            </Text>
          </Pressable>
        )}

      {nftStatus.isListed &&
        !nftStatus.fromCurrentUser &&
        !nftStatus.alreadyBought &&
        nftStatus.stock > 0 && (
          <Pressable
            onPress={handleCollectButton}
            style={{
              backgroundColor: apidonPink,
              padding: 20,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              bold
              style={{
                color: "white",
                fontSize: 18,
              }}
            >
              Collect
            </Text>
          </Pressable>
        )}

      {nftStatus.isListed &&
        !nftStatus.fromCurrentUser &&
        !nftStatus.alreadyBought &&
        nftStatus.stock <= 0 && (
          <Pressable
            style={{
              opacity: 0.5,
              backgroundColor: apidonPink,
              padding: 20,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              bold
              style={{
                color: "white",
                fontSize: 18,
              }}
            >
              Out of Stock
            </Text>
          </Pressable>
        )}
    </View>
  );
};

export default NftBottomSheetContent;
