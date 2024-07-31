import { apidonPink } from "@/constants/Colors";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import React from "react";
import { Easing, Pressable, View } from "react-native";

import { Text } from "@/components/Text/Text";

import TextTicker from "react-native-text-ticker";

type Props = {
  username: string;
  nftOptionsModalRef: React.RefObject<BottomSheetModalMethods>;
};

const NFTTag = ({ username, nftOptionsModalRef }: Props) => {
  const handleNFTButton = () => {
    nftOptionsModalRef.current?.present();
  };

  return (
    <Pressable
      onPress={handleNFTButton}
      id="nft-tag"
      style={{
        width: "30%",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: apidonPink,
        borderRadius: 5,
        paddingTop: 5,
        paddingHorizontal: 5,
      }}
    >
      <TextTicker
        style={{ textAlign: "center" }}
        duration={10000}
        animationType="scroll"
        repeatSpacer={50}
        scroll={false}
        easing={Easing.linear}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Text
            bold
            style={{
              color: apidonPink,
              textAlign: "center",
            }}
            fontSize={11}
          >
            Collectible
          </Text>
          <Text fontSize={11}>by</Text>
          <Text
            bold
            fontSize={11}
            numberOfLines={1}
            style={{
              overflow: "hidden",
            }}
          >
            {username}
          </Text>
        </View>
      </TextTicker>
    </Pressable>
  );
};

export default NFTTag;
