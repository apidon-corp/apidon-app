import { FlatList, Pressable, View } from "react-native";
import { Text } from "@/components/Text/Text";
import React, { useState } from "react";
import NftOnUserPreviewItem from "../Nft/NftOnUserPreviewItem";
import {
  BoughtCollectiblesArrayObject,
  CreatedCollectiblesArrayObject,
} from "@/types/Trade";

type Props = {
  createdCollectibles: CreatedCollectiblesArrayObject[];
  boughtCollectibles: BoughtCollectiblesArrayObject[];
};

type Option = "all" | "collected" | "created";

const NftContent = ({ createdCollectibles, boughtCollectibles }: Props) => {
  const [option, setOption] = useState<Option>("all");

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
          data={[...createdCollectibles, ...boughtCollectibles].sort(
            (a, b) => b.ts - a.ts
          )}
          renderItem={({ item }) => (
            <NftOnUserPreviewItem
              collectibleDocPath={item.collectibleDocPath}
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
          data={[...boughtCollectibles]}
          renderItem={({ item }) => (
            <NftOnUserPreviewItem
              collectibleDocPath={item.collectibleDocPath}
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
          data={[...createdCollectibles]}
          renderItem={({ item }) => (
            <NftOnUserPreviewItem
              collectibleDocPath={item.collectibleDocPath}
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
