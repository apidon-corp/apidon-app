import { Text } from "@/components/Text/Text";
import {
  BoughtCollectibleDocData,
  CreatedCollectibleDocData,
} from "@/types/Trade";
import React from "react";
import { FlatList, Pressable, View } from "react-native";
import CollectibleOnUserPreviewItem from "../Collectible/CollectibleOnUserPreviewItem";

type CollectibleContentType = "collected" | "created";

type Props = {
  createdCollectibles: CreatedCollectibleDocData[];
  boughtCollectibles: BoughtCollectibleDocData[];
  collectibleContentTypeValue: CollectibleContentType;
  setCollectibleContentTypeValue: React.Dispatch<
    React.SetStateAction<CollectibleContentType>
  >;
};

const CollectibleContent = ({
  createdCollectibles,
  boughtCollectibles,
  collectibleContentTypeValue,
  setCollectibleContentTypeValue,
}: Props) => {
  const handleChangeOption = (option: CollectibleContentType) => {
    setCollectibleContentTypeValue(option);
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
              handleChangeOption("created");
            }}
            style={[
              {
                width: "50%",
                paddingVertical: 4,
                justifyContent: "center",
                alignItems: "center",
              },
              collectibleContentTypeValue === "created" && {
                backgroundColor: "#707070",
              },
            ]}
          >
            <Text>Created</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              handleChangeOption("collected");
            }}
            style={[
              {
                width: "50%",
                paddingVertical: 4,
                justifyContent: "center",
                alignItems: "center",
              },
              collectibleContentTypeValue === "collected" && {
                backgroundColor: "#707070",
              },
            ]}
          >
            <Text>Collected</Text>
          </Pressable>
        </View>
      </View>

      {collectibleContentTypeValue === "collected" && (
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

      {collectibleContentTypeValue === "created" && (
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
