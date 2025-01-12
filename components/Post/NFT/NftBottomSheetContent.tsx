import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import { Text } from "@/components/Text/Text";
import { apidonPink } from "@/constants/Colors";
import { useAuth } from "@/providers/AuthProvider";
import { CollectibleDocData } from "@/types/Collectible";
import { PostServerData } from "@/types/Post";
import { UserInServer } from "@/types/User";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useSetAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

type Props = {
  postData: PostServerData;
  postSenderData: UserInServer;
  closeNFTBottomSheet: () => void;
};

type CollectibleStatus =
  | "not-collectible"
  | {
      fromCurrentUser: boolean;
      alreadyBought: boolean;
    };

const NftBottomSheetContent = ({
  postData,
  postSenderData,
  closeNFTBottomSheet,
}: Props) => {
  const { authStatus } = useAuth();

  const [collectibleDocData, setCollectibleDocData] =
    useState<CollectibleDocData | null>(null);
  const [collectibleStatus, setCollectibleStatus] =
    useState<CollectibleStatus | null>(null);

  const setScreenParameters = useSetAtom(screenParametersAtom);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    if (!postData.collectibleStatus.isCollectible) return;

    const unsubscribe = firestore()
      .doc(postData.collectibleStatus.collectibleDocPath)
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) {
            console.error(
              "Colectible doc does not exist: ",
              postData.collectibleStatus
            );
            return setCollectibleDocData(null);
          }

          const collectibleDocDataFetched =
            snapshot.data() as CollectibleDocData;

          return setCollectibleDocData(collectibleDocDataFetched);
        },
        (error) => {
          console.error(
            "Error on getting realtime collectible data at: \n",
            postData.collectibleStatus,
            "\n",
            error
          );
          return setCollectibleDocData(null);
        }
      );
    return () => unsubscribe();
  }, [authStatus]);

  useEffect(() => {
    if (!collectibleDocData) return setCollectibleStatus(null);

    const currentUserDisplayName = auth().currentUser?.displayName;
    if (!currentUserDisplayName) return setCollectibleStatus(null);

    const unsubscribe = firestore()
      .collection(`collectibles/${collectibleDocData.id}/collectors`)
      .where("username", "==", currentUserDisplayName)
      .onSnapshot(
        (snapshot) => {
          if (snapshot.empty) {
            setCollectibleStatus({
              alreadyBought: false,
              fromCurrentUser:
                postData.senderUsername === currentUserDisplayName,
            });
          } else {
            setCollectibleStatus({
              alreadyBought: true,
              fromCurrentUser:
                postData.senderUsername === currentUserDisplayName,
            });
          }
        },
        (error) => {
          console.error(
            "Error on getting realtime collectible data at: \n",
            error
          );
          return setCollectibleStatus(null);
        }
      );

    return () => unsubscribe();
  }, [collectibleDocData]);

  const handleCollectButton = () => {
    closeNFTBottomSheet();

    setScreenParameters([
      {
        queryId: "postDocPath",
        value: `users/${postSenderData.username}/posts/${postData.id}`,
      },
    ]);

    router.push("/(modals)/buyCollectible");
  };

  const handleSeeCollectors = () => {
    setScreenParameters([
      {
        queryId: "postDocPath",
        value: `posts/${postData.id}`,
      },
    ]);

    router.push("/(modals)/collectors");
  };

  const handleShowCodesButton = () => {
    setScreenParameters([
      {
        queryId: "postDocPath",
        value: `posts/${postData.id}`,
      },
    ]);

    router.push("/(modals)/codes");

    closeNFTBottomSheet();
  };

  if (!collectibleStatus || !collectibleDocData) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          height: 291,
        }}
      >
        <ActivityIndicator color="white" />
      </View>
    );
  }

  if (collectibleStatus === "not-collectible") {
    return <Text>Not collectible.</Text>;
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
            <View
              id="fullname-verifed"
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 3,
              }}
            >
              <Text
                bold
                style={{
                  fontSize: 14,
                }}
              >
                {postSenderData.fullname}
              </Text>
              {postSenderData.verified && (
                <MaterialIcons name="verified" size={18} color={apidonPink} />
              )}
            </View>

            <Text
              style={{
                fontSize: 12,
              }}
            >
              @{postData.senderUsername}
            </Text>
          </View>
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

      <View
        id="price-stock"
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        {collectibleDocData.type === "trade" && (
          <>
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
                ${collectibleDocData.price.price}
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
                {collectibleDocData.stock.remainingStock} Left
              </Text>
            </View>
          </>
        )}

        {collectibleDocData.type === "event" && (
          <>
            <View
              id="stock"
              style={{
                flex: 1,
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
                {collectibleDocData.stock.remainingStock} Left
              </Text>
            </View>
          </>
        )}
      </View>

      {collectibleDocData.type === "trade" &&
        collectibleStatus.fromCurrentUser && (
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

      {collectibleDocData.type === "trade" &&
        !collectibleStatus.fromCurrentUser &&
        collectibleStatus.alreadyBought && (
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View
              id="collected-button"
              style={{
                width: "78%",
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
            </View>
            <Pressable
              onPress={handleSeeCollectors}
              id="collectors"
              style={{
                width: "20%",
                backgroundColor: "#323232",
                padding: 20,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FontAwesome name="users" size={24} color="white" />
            </Pressable>
          </View>
        )}

      {collectibleDocData.type === "trade" &&
        !collectibleStatus.fromCurrentUser &&
        !collectibleStatus.alreadyBought &&
        collectibleDocData.stock.remainingStock > 0 && (
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Pressable
              onPress={handleCollectButton}
              style={{
                width: "78%",
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
            <Pressable
              onPress={handleSeeCollectors}
              id="collectors"
              style={{
                width: "20%",
                backgroundColor: "#323232",
                padding: 20,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FontAwesome name="users" size={24} color="white" />
            </Pressable>
          </View>
        )}

      {collectibleDocData.type === "trade" &&
        !collectibleStatus.fromCurrentUser &&
        !collectibleStatus.alreadyBought &&
        collectibleDocData.stock.remainingStock <= 0 && (
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                width: "78%",
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
            </View>
            <Pressable
              onPress={handleSeeCollectors}
              id="collectors"
              style={{
                width: "20%",
                backgroundColor: "#323232",
                padding: 20,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FontAwesome name="users" size={24} color="white" />
            </Pressable>
          </View>
        )}

      {collectibleDocData.type === "event" &&
        !collectibleStatus.fromCurrentUser && (
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

      {collectibleDocData.type === "event" &&
        collectibleStatus.fromCurrentUser && (
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Pressable
              onPress={handleShowCodesButton}
              id="show-codes-button"
              style={{
                width: "78%",
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
                Show Codes
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSeeCollectors}
              id="collectors"
              style={{
                width: "20%",
                backgroundColor: "#323232",
                padding: 20,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FontAwesome name="users" size={24} color="white" />
            </Pressable>
          </View>
        )}
    </View>
  );
};

export default NftBottomSheetContent;
