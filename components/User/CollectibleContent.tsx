import { Text } from "@/components/Text/Text";
import {
  BoughtCollectibleDocData,
  CreatedCollectibleDocData,
} from "@/types/Trade";
import React, { useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import CollectibleOnUserPreviewItem from "../Collectible/CollectibleOnUserPreviewItem";

type Props = {
  createdCollectibles: CreatedCollectibleDocData[];
  boughtCollectibles: BoughtCollectibleDocData[];
};

type Option = "all" | "collected" | "created";

const CollectibleContent = ({
  createdCollectibles,
  boughtCollectibles,
}: Props) => {
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
            width: "75%",
          }}
        >
          <Pressable
            onPress={() => {
              handleChangeOption("all");
            }}
            style={[
              {
                width: "33.3%",
                paddingVertical: 4,
                justifyContent: "center",
                alignItems: "center",
              },
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
              {
                width: "33.3%",
                paddingVertical: 4,
                justifyContent: "center",
                alignItems: "center",
              },
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
              {
                width: "33.3%",
                paddingVertical: 4,
                justifyContent: "center",
                alignItems: "center",
              },
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
            gap: 10,
          }}
          keyExtractor={(item) => item.postDocPath}
          numColumns={1}
          scrollEnabled={false}
          data={[...createdCollectibles, ...boughtCollectibles].sort(
            (a, b) => b.ts - a.ts
          )}
          renderItem={({ item }) => (
            <CollectibleOnUserPreviewItem
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
            gap: 10,
          }}
          keyExtractor={(item) => item.postDocPath}
          numColumns={1}
          scrollEnabled={false}
          data={[...boughtCollectibles]}
          renderItem={({ item }) => (
            <CollectibleOnUserPreviewItem
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
            gap: 10,
          }}
          keyExtractor={(item) => item.postDocPath}
          numColumns={1}
          scrollEnabled={false}
          data={[...createdCollectibles]}
          renderItem={({ item }) => (
            <CollectibleOnUserPreviewItem
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

export default CollectibleContent;
