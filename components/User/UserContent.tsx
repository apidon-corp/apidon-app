import { Text } from "@/components/Text/Text";
import { apidonPink } from "@/constants/Colors";
import { useAuth } from "@/providers/AuthProvider";
import { NFTTradeDocData } from "@/types/Trade";
import { UserInServer } from "@/types/User";
import firestore from "@react-native-firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, View } from "react-native";
import { FlatList, Switch } from "react-native-gesture-handler";
import Post from "../Post/Post";
import Header from "./Header";
import NftContent from "./NftContent";
import { useAtomValue } from "jotai";
import { screenParametersAtom } from "@/atoms/screenParamatersAtom";

type Props = {
  username: string;
};

const UserContent = ({ username }: Props) => {
  const {authStatus} = useAuth();

  const screenParameters = useAtomValue(screenParametersAtom);
  const collectedNFTPostDocPath = screenParameters.find(
    (q) => q.queryId === "collectedNFTPostDocPath"
  )?.value as string;

  const [postDocPathArray, setPostDocPathArray] = useState<string[]>([]);
  const [nftData, setNftData] = useState<{
    createdNFTs: { nftDocPath: string; postDocPath: string; ts: number }[];
    boughtNFTs: { nftDocPath: string; postDocPath: string; ts: number }[];
  }>({
    createdNFTs: [],
    boughtNFTs: [],
  });

  const [userData, setUserData] = useState<UserInServer | null>(null);

  const [toggleValue, setToggleValue] = useState<"posts" | "nfts">("nfts");

  const { height } = Dimensions.get("window");

  const onToggleValueChange = () => {
    setToggleValue((prev) => (prev === "posts" ? "nfts" : "posts"));
  };

  // Post Fetching
  useEffect(() => {
    if (authStatus !== "authenticated") return;
    if (!username) return;

    setPostDocPathArray([]);

    const unsubscribe = firestore()
      .collection(`users/${username}/posts`)
      .orderBy("creationTime", "desc")
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            setPostDocPathArray((prev) => [change.doc.ref.path, ...prev]);
          } else if (change.type === "removed") {
            setPostDocPathArray((prev) =>
              prev.filter((path) => path !== change.doc.ref.path)
            );
          }
        });
      });

    return () => unsubscribe();
  }, [username, authStatus]);

  // NFTs Fetching
  useEffect(() => {
    if (authStatus !== "authenticated") return;
    if (!username) return;

    const unsubscribe = firestore()
      .doc(`users/${username}/nftTrade/nftTrade`)
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) {
            console.error("NFT Trade doc doesn't exist.");
            return setNftData({
              createdNFTs: [],
              boughtNFTs: [],
            });
          }

          const nftTradeData = snapshot.data() as NFTTradeDocData;
          if (!nftTradeData) {
            console.error("NFT Trade doc doesn't exist.");
            return setNftData({
              createdNFTs: [],
              boughtNFTs: [],
            });
          }

          const boughtNFTs = nftTradeData.boughtNFTs;

          boughtNFTs.sort((a, b) => b.ts - a.ts);

          if (!boughtNFTs) {
            console.error("BoughtNFTs is undefined on nftTrade doc");
            return setNftData({
              createdNFTs: [],
              boughtNFTs: [],
            });
          }

          const createdNFTs = nftTradeData.createdNFTs;

          createdNFTs.sort((a, b) => b.ts - a.ts);

          if (!createdNFTs) {
            console.error("CreatedNFTs is undefined on nftTrade doc");
            return setNftData({
              createdNFTs: [],
              boughtNFTs: [],
            });
          }

          return setNftData({
            createdNFTs: createdNFTs.map((c) => {
              return {
                nftDocPath: c.nftDocPath,
                postDocPath: c.postDocPath,
                ts: c.ts,
              };
            }),
            boughtNFTs: boughtNFTs.map((b) => {
              return {
                nftDocPath: b.nftDocPath,
                postDocPath: b.postDocPath,
                ts: b.ts,
              };
            }),
          });
        },
        (error) => {
          console.error("Error on getting realtime nftTrade data: ", error);
          return setNftData({
            createdNFTs: [],
            boughtNFTs: [],
          });
        }
      );

    () => unsubscribe();
  }, [username, authStatus]);

  // User Data Fetching
  useEffect(() => {
    if (authStatus !== "authenticated") return;
    if (!username) return;

    const unsubscribe = firestore()
      .doc(`users/${username}`)
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) {
            console.error("User's realtime data can not be fecthed.");
            return setUserData(null);
          }

          const userDocData = snapshot.data() as UserInServer;

          setUserData(userDocData);
        },
        (error) => {
          console.error("Error on getting realtime data: ", error);
          return setUserData(null);
        }
      );

    return () => unsubscribe();
  }, [username, authStatus]);

  // New Purchased NFT Showing
  useEffect(() => {
    if (!collectedNFTPostDocPath) return;

    setToggleValue("nfts");
  }, [collectedNFTPostDocPath]);

  if (!userData)
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          height: height,
        }}
      >
        <ActivityIndicator color="white" size="large" />
      </View>
    );

  return (
    <>
      <Header userData={userData} />
      <View
        id="toggle"
        style={{
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 10,
          marginVertical: 15,
        }}
      >
        <Text
          bold
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
          bold
          style={{
            fontSize: 14,
          }}
        >
          NFTs
        </Text>
      </View>

      {toggleValue === "posts" && (
        <FlatList
          contentContainerStyle={{
            gap: 20,
          }}
          keyExtractor={(item) => item}
          data={postDocPathArray}
          renderItem={({ item }) => <Post postDocPath={item} key={item} />}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      )}

      {toggleValue === "nfts" && (
        <>
          <NftContent
            createdNFTs={nftData.createdNFTs}
            boughtNFTs={nftData.boughtNFTs}
          />
        </>
      )}
    </>
  );
};

export default UserContent;
