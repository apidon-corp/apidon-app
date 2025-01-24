import Text from "@/components/Text/Text";
import { apidonPink } from "@/constants/Colors";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import React, { useState } from "react";
import { View } from "react-native";
import { ThemedButton } from "react-native-really-awesome-button";

type Props = {
  nftOptionsModalRef: React.RefObject<BottomSheetModalMethods>;
};

const PADDING_VALUE = 5;

const NFTTag = ({ nftOptionsModalRef }: Props) => {
  const handleNFTButton = () => {
    nftOptionsModalRef.current?.present();
  };

  const [componentWidth, setComponentWidth] = useState(0);

  return (
    <View
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setComponentWidth(width);
      }}
      style={{
        padding: PADDING_VALUE,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ThemedButton
        onPress={handleNFTButton}
        name="rick"
        width={componentWidth - PADDING_VALUE}
        height={40 - PADDING_VALUE}
        paddingBottom={0}
        paddingHorizontal={0}
        paddingTop={0}
        backgroundColor={apidonPink}
        backgroundDarker="rgba(213, 63, 140, 0.5)"
      >
        <Text fontSize={12} bold>
          Collectible
        </Text>
      </ThemedButton>
    </View>
  );
};

export default NFTTag;
