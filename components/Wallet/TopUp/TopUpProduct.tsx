import { Text } from "@/components/Text/Text";
import { Pressable } from "react-native";

import React from "react";

import { useAuth } from "@/providers/AuthProvider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { PurchasesStoreProduct } from "react-native-purchases";

type Props = {
  id: string;
  product: PurchasesStoreProduct;
  setChosenProduct: React.Dispatch<
    React.SetStateAction<{
      product: PurchasesStoreProduct;
      price: string;
    } | null>
  >;
  topUpInformationBottomSheetModalRef: React.RefObject<BottomSheetModal>;
};

const TopUpProduct = ({
  id,
  setChosenProduct,
  topUpInformationBottomSheetModalRef,
  product,
}: Props) => {
  const { authStatus } = useAuth();

  const price = id.split("_")[0];

  const handlePressProduct = () => {
    if (!topUpInformationBottomSheetModalRef.current) return;

    setChosenProduct({
      price: price,
      product: product,
    });

    topUpInformationBottomSheetModalRef.current.present();
  };

  if (authStatus !== "authenticated") {
    console.error("User is not authenticated to see topUpProduct");
    return <></>;
  }

  return (
    <Pressable
      id="root"
      onPress={handlePressProduct}
      style={{
        width: "30%",
        aspectRatio: 1,
        backgroundColor: "rgba(255,255,255,0.09)",
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <>
        <Text id="price" fontSize={28} bold>
          ${price}
        </Text>
        <Text id="currency">USD</Text>
      </>
    </Pressable>
  );
};

export default TopUpProduct;
