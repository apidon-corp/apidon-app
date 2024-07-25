import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  View,
} from "react-native";
import { Text } from "@/components/Text/Text";

import React, { useState } from "react";
import { ItemSKU } from "@/types/IAP";

import Purchases, { PurchasesStoreProduct } from "react-native-purchases";
import { useAuth } from "@/providers/AuthProvider";

type Props = {
  id: ItemSKU;
  product: PurchasesStoreProduct;
};

const TopUpProduct = ({ id, product }: Props) => {
  const { authStatus } = useAuth();

  const { width } = Dimensions.get("screen");

  const [loading, setLoading] = useState(false);

  const price = id.split("_")[0];

  const handlePressProduct = () => {
    if (loading) return;

    Alert.alert(
      "Top Up Balance", // Title
      `Are you sure you want to top up your balance with ${price} USD?`, // Message
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: handleTopUp,
        },
      ]
    );
  };

  const handleTopUp = async () => {
    setLoading(true);

    try {
      await Purchases.purchaseStoreProduct(product);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);

      if (error.userCancelled) return console.log("User cancelled");

      Alert.alert("Error", "Error on purchasing product.");
      console.error("Error purchasing product: \n", id, "\n", error);
    }
  };

  if (authStatus !== "authenticated") {
    console.error("User is not authenticated to see topUpProduct");
    return <></>;
  }

  return (
    <Pressable id="root" onPress={handlePressProduct} disabled={loading}>
      <View
        id="price-container"
        style={{
          height: (width - 30) / 3,
          width: (width - 30) / 3,
          backgroundColor: "#202020",
          borderWidth: 1,
          borderColor: "gray",
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator color="gray" />
        ) : (
          <>
            <Text id="price" fontSize={32} bold>
              ${price}
            </Text>
            <Text id="currency">USD</Text>
          </>
        )}
      </View>
    </Pressable>
  );
};

export default TopUpProduct;
