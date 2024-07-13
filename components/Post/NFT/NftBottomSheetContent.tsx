import { View, Pressable, ActivityIndicator } from "react-native";
import { Text } from "@/components/Text/Text";
import React, { useEffect, useState } from "react";
import { apidonPink } from "@/constants/Colors";
import { PostServerData } from "@/types/Post";
import { UserInServer } from "@/types/User";
import { Image } from "expo-image";

import auth from "@react-native-firebase/auth";
import { useAuth } from "@/providers/AuthProvider";
import firestore from "@react-native-firebase/firestore";
import { NftDocDataInServer } from "@/types/Nft";
import { useSetAtom } from "jotai";
import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import { router } from "expo-router";

type Props = {
  postData: PostServerData;
  postSenderData: UserInServer;
};

const NftBottomSheetContent = ({ postData, postSenderData }: Props) => {
  const authStatus = useAuth();

  const [nftDocData, setNftDocData] = useState<NftDocDataInServer | null>(null);

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
            console.log(
              "NFT doc does not exist: ",
              postData.nftStatus.nftDocPath
            );
            return setNftDocData(null);
          }

          const nftDocDataFetched = snapshot.data() as NftDocDataInServer;

          return setNftDocData(nftDocDataFetched);
        },
        (error) => {
          console.log(
            "Error on getting realtime nft data at: \n",
            postData.nftStatus.convertedToNft,
            "\n",
            error
          );
          return setNftDocData(null);
        }
      );
    () => unsubscribe();
  }, [authStatus]);

  const handleSetPriceButton = () => {
    setScreenParameters([
      {
        queryId: "postDocPath",
        value: `users/${postSenderData.username}/posts/${postData.id}`,
      },
    ]);

    return router.push("/(modals)/listNFT");
  };

  if (!nftDocData) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="white" />
      </View>
    );
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

      {nftDocData.listStatus.isListed && (
        <View
          id="price-reminder"
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
              {nftDocData.listStatus.price}
            </Text>
          </View>
          <View
            id="reminder"
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
               {nftDocData.listStatus.stock} Left
            </Text>
          </View>
        </View>
      )}

      {nftDocData.listStatus.isListed ? (
        <>
          {postSenderData.username === auth().currentUser?.displayName ? (
            <Pressable
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
          ) : (
            <Pressable
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
        </>
      ) : (
        postData.senderUsername === auth().currentUser?.displayName && (
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
        )
      )}
    </View>
  );
};

export default NftBottomSheetContent;
