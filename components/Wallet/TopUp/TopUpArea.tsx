import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import React, { useRef, useState } from "react";
import Text from "@/components/Text/Text";
import { useInAppPurchases } from "@/hooks/useInAppPurchases";
import TopUpProduct from "./TopUpProduct";
import CustomBottomModalSheet from "@/components/BottomSheet/CustomBottomModalSheet";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import Purchases, { PurchasesStoreProduct } from "react-native-purchases";
import { usePathname } from "expo-router";

const TopUpArea = () => {
  const { products } = useInAppPurchases();

  const topUpInformationBottomSheetModalRef = useRef<BottomSheetModal>(null);

  const [chosenProduct, setChosenProduct] = useState<{
    product: PurchasesStoreProduct;
    price: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);

  const pathname = usePathname();

  const handleAcceptButton = async () => {
    if (!chosenProduct?.product) return;
    if (!topUpInformationBottomSheetModalRef.current) return;

    if (loading) return;

    setLoading(true);

    try {
      await Purchases.purchaseStoreProduct(chosenProduct.product);
      topUpInformationBottomSheetModalRef.current.close();
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      if (error.userCancelled) return console.log("User cancelled");
      console.error(error);
    }
  };

  const handleCancelButton = () => {
    if (!topUpInformationBottomSheetModalRef.current) return;
    topUpInformationBottomSheetModalRef.current.close();
  };

  return (
    <>
      <View style={{ width: "100%", gap: 20, padding: 15 }}>
        <View
          id="title"
          style={{
            justifyContent: "center",
          }}
        >
          <Text bold fontSize={24}>
            Top Up
          </Text>
          <Text
            style={{
              color: "white",
            }}
          >
            Choose from below options to top up!
          </Text>
        </View>

        {products.length === 0 ? (
          <View>
            <ActivityIndicator />
          </View>
        ) : (
          <FlatList
            contentContainerStyle={{
              width: "100%",
              gap: 10,
            }}
            columnWrapperStyle={{
              width: "100%",
              justifyContent: "space-between",
              gap: 10,
            }}
            data={products}
            renderItem={({ item }) => (
              <TopUpProduct
                id={item.identifier}
                product={item}
                key={item.identifier}
                setChosenProduct={setChosenProduct}
                topUpInformationBottomSheetModalRef={
                  topUpInformationBottomSheetModalRef
                }
              />
            )}
            numColumns={3}
            scrollEnabled={false}
            keyExtractor={(item) => item.identifier}
          />
        )}
      </View>

      {pathname === "/home/collectibles/wallet" ? (
        <CustomBottomModalSheet
          ref={topUpInformationBottomSheetModalRef}
          backgroundColor="#1B1B1B"
        >
          <View style={{ flex: 1, gap: 15, padding: 10 }}>
            <Text fontSize={18} bold>
              Confirm Your ${chosenProduct?.price} Purhcase
            </Text>
            <Text fontSize={13}>
              You are about to purchase a top-up of ${chosenProduct?.price}.
            </Text>
            <Text fontSize={13}>
              You can use the full amount of this credit to purchase digital
              items without any fees.
            </Text>
            <Text fontSize={13}>
              If you haven't made any transactions, you can request a full
              refund through Apple following their guidelines. However, if you
              have made transactions, withdrawing the amount will incur fees,
              and only 60% of the remaining balance (except wire fee) will be
              refundable.
            </Text>
            <Text
              fontSize={13}
              style={{
                textDecorationLine: "underline",
              }}
            >
              Please note that the update to your balance may take a few
              minutes.
            </Text>
            <Text fontSize={13}>Please review and confirm your purchase.</Text>
            <Pressable
              onPress={handleAcceptButton}
              style={{
                backgroundColor: "white",
                padding: 10,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {loading ? (
                <ActivityIndicator color="black" size="small" />
              ) : (
                <Text style={{ color: "black" }}>Confirm</Text>
              )}
            </Pressable>
            <Pressable
              disabled={loading}
              onPress={handleCancelButton}
              style={{
                borderWidth: 1,
                borderColor: "white",
                padding: 10,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text>Cancel</Text>
            </Pressable>
          </View>
        </CustomBottomModalSheet>
      ) : (
        <BottomSheetModalProvider>
          <CustomBottomModalSheet
            ref={topUpInformationBottomSheetModalRef}
            backgroundColor="#1B1B1B"
          >
            <View style={{ flex: 1, gap: 15, padding: 10 }}>
              <Text fontSize={18} bold>
                Confirm Your ${chosenProduct?.price} Purhcase
              </Text>
              <Text fontSize={13}>
                You are about to purchase a top-up of ${chosenProduct?.price}.
              </Text>
              <Text fontSize={13}>
                You can use the full amount of this credit to purchase digital
                items without any fees.
              </Text>
              <Text fontSize={13}>
                If you haven't made any transactions, you can request a full
                refund through Apple following their guidelines. However, if you
                have made transactions, withdrawing the amount will incur fees,
                and only 60% of the remaining balance (except wire fee) will be
                refundable.
              </Text>
              <Text
                fontSize={13}
                style={{
                  textDecorationLine: "underline",
                }}
              >
                Please note that the update to your balance may take a few
                minutes.
              </Text>
              <Text fontSize={13}>
                Please review and confirm your purchase.
              </Text>
              <Pressable
                onPress={handleAcceptButton}
                style={{
                  backgroundColor: "white",
                  padding: 10,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {loading ? (
                  <ActivityIndicator color="black" size="small" />
                ) : (
                  <Text style={{ color: "black" }}>Confirm</Text>
                )}
              </Pressable>
              <Pressable
                disabled={loading}
                onPress={handleCancelButton}
                style={{
                  borderWidth: 1,
                  borderColor: "white",
                  padding: 10,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text>Cancel</Text>
              </Pressable>
            </View>
          </CustomBottomModalSheet>
        </BottomSheetModalProvider>
      )}
    </>
  );
};

export default TopUpArea;
