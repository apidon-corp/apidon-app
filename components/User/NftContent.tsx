import { FlatList, Pressable, View } from "react-native";
import { Text } from "@/components/Text/Text";
import React, { useState } from "react";
import NftOnUserPreviewItem from "../Nft/NftOnUserPreviewItem";

type Props = {
  createdNFTs: { postDocPath: string; nftDocPath: string }[];
  boughtNFTs: { postDocPath: string; nftDocPath: string }[];
  soldNFTs: { postDocPath: string; nftDocPath: string }[];
};

type Option = "all" | "collected" | "created";

const NftContent = ({ createdNFTs, boughtNFTs, soldNFTs }: Props) => {
  const [option, setOption] = useState<Option>("created");

  const handleChangeOption = (option: Option) => {
    setOption(option);
  };

  return (
    <>
      <View
        id="tabs-root"
        style={{
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          id="tabs"
          style={{
            borderWidth: 1,
            borderColor: "gray",
            borderRadius: 10,
            overflow: "hidden",
            flexDirection: "row",
            backgroundColor: "#323232",
          }}
        >
          <Pressable
            onPress={() => {
              handleChangeOption("all");
            }}
            style={[
              { paddingVertical: 4, paddingHorizontal: 15 },
              option === "all" && { backgroundColor: "#707070" },
            ]}
          >
            <Text>All</Text>
          </Pressable>

          <View style={{ width: 1, backgroundColor: "black" }} />

          <Pressable
            onPress={() => {
              handleChangeOption("created");
            }}
            style={[
              { paddingVertical: 4, paddingHorizontal: 15 },
              option === "created" && { backgroundColor: "#707070" },
            ]}
          >
            <Text>Created</Text>
          </Pressable>

          <View style={{ width: 1, backgroundColor: "black" }} />

          <Pressable
            onPress={() => {
              handleChangeOption("collected");
            }}
            style={[
              { paddingVertical: 4, paddingHorizontal: 15 },
              option === "collected" && { backgroundColor: "#707070" },
            ]}
          >
            <Text>Collected</Text>
          </Pressable>
        </View>
      </View>

      {option === "all" && (
        <FlatList
          contentContainerStyle={{
            gap: 20,
          }}
          keyExtractor={(item) => item.postDocPath}
          numColumns={1}
          scrollEnabled={false}
          data={[...createdNFTs, ...boughtNFTs]}
          renderItem={({ item }) => (
            <NftOnUserPreviewItem
              nftDocPath={item.nftDocPath}
              postDocPath={item.postDocPath}
              key={item.postDocPath}
            />
          )}
        />
      )}
      {option === "collected" && (
        <FlatList
          contentContainerStyle={{
            gap: 20,
          }}
          keyExtractor={(item) => item.postDocPath}
          numColumns={1}
          scrollEnabled={false}
          data={[...boughtNFTs]}
          renderItem={({ item }) => (
            <NftOnUserPreviewItem
              nftDocPath={item.nftDocPath}
              postDocPath={item.postDocPath}
              key={item.postDocPath}
            />
          )}
        />
      )}
      {option === "created" && (
        <FlatList
          contentContainerStyle={{
            gap: 20,
          }}
          keyExtractor={(item) => item.postDocPath}
          numColumns={1}
          scrollEnabled={false}
          data={[...createdNFTs]}
          renderItem={({ item }) => (
            <NftOnUserPreviewItem
              nftDocPath={item.nftDocPath}
              postDocPath={item.postDocPath}
              key={item.postDocPath}
            />
          )}
        />
      )}
    </>
  );
};

export default NftContent;
