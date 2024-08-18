import React from "react";
import { Pressable, View } from "react-native";
import Text from "../Text/Text";
import { BubbleId, PlanCardData } from "@/types/Plans";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import Purchases, {
  PRODUCT_CATEGORY,
  PRODUCT_TYPE,
  PurchasesStoreProduct,
} from "react-native-purchases";

type Props = {
  planCardData: PlanCardData;
  bottomSheetModalRef: React.RefObject<BottomSheetModalMethods>;
  setInformationBubbleId: React.Dispatch<React.SetStateAction<BubbleId>>;
};

const PlanCard = ({
  planCardData: {
    title,
    canCollectSoldOutItems,
    collectibleLimit,
    price,
    stockLimit,
  },
  bottomSheetModalRef,
  setInformationBubbleId,
}: Props) => {
  const handlePressInformationBubble = (id: BubbleId) => {
    setInformationBubbleId(id);
    if (bottomSheetModalRef.current) bottomSheetModalRef.current.present();
  };

  const handleSubscribeButton = async () => {
    try {
      await Purchases.purchaseStoreProduct({
        currencyCode: "USD",
        description: "Take your first steps with Collector!",
        discounts: [],
        identifier: "dev_apidon_collector_10_1m",
        introPrice: null,
        price: 10,
        pricePerMonth: 10,
        pricePerMonthString: "$10.00",
        pricePerWeek: 2.3,
        pricePerWeekString: "$2.30",
        pricePerYear: 120,
        pricePerYearString: "$120.00",
        priceString: "$10.00",
        productCategory: PRODUCT_CATEGORY.SUBSCRIPTION,
        productType: PRODUCT_TYPE.AUTO_RENEWABLE_SUBSCRIPTION,
        subscriptionPeriod: "P1M",
        title: "Collector (Monthly)",
        defaultOption: null,
        subscriptionOptions: null,
        presentedOfferingIdentifier: null,
        presentedOfferingContext: null,
      });
    } catch (error) {}
  };

  return (
    <View
      id="root"
      style={{
        width: "100%",
        flex: 1,
        padding: 10,
        gap: 15,
      }}
    >
      <View
        id="title-area"
        style={{
          width: "100%",
          padding: 10,
          backgroundColor: "rgba(255,255,255,0.2)",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 10,
        }}
      >
        <Text bold fontSize={18}>
          {title}
        </Text>
      </View>

      <View
        id="plan-details"
        style={{
          width: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          padding: 10,
          borderRadius: 10,
          gap: 15,
        }}
      >
        <Text bold fontSize={12} style={{ color: "white" }}>
          Plan Details
        </Text>

        <View
          id="details-body"
          style={{
            width: "100%",
            gap: 10,
          }}
        >
          <View
            id="can-collect-sold-out"
            style={{
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: "row",
            }}
          >
            <Pressable
              onPress={() => {
                handlePressInformationBubble("collect-sold-out");
              }}
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Text fontSize={13}>Collect Sold Out</Text>
              <Ionicons name="information-circle" size={18} color="gray" />
            </Pressable>

            {canCollectSoldOutItems ? (
              <Ionicons name="checkmark-circle" size={24} color="green" />
            ) : (
              <Ionicons name="close-circle" size={24} color="red" />
            )}
          </View>

          <View
            id="collectible-limit"
            style={{
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: "row",
            }}
          >
            <Pressable
              onPress={() => {
                handlePressInformationBubble("collectible-limit");
              }}
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Text fontSize={13}>Collectible Limit</Text>
              <Ionicons name="information-circle" size={18} color="gray" />
            </Pressable>

            <Text fontSize={14} bold>
              {collectibleLimit}
            </Text>
          </View>

          <View
            id="stock-limit"
            style={{
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: "row",
            }}
          >
            <Pressable
              onPress={() => {
                handlePressInformationBubble("stock-limit");
              }}
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Text fontSize={13}>Stock Limit</Text>
              <Ionicons name="information-circle" size={18} color="gray" />
            </Pressable>

            <Text fontSize={14} bold>
              {stockLimit}
            </Text>
          </View>
        </View>
      </View>

      <View
        id="subscribe-button"
        style={{
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          display: price === "free" ? "none" : undefined,
        }}
      >
        <Pressable
          onPress={handleSubscribeButton}
          style={{
            width: "50%",
            padding: 10,
            backgroundColor: "white",
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            fontSize={13}
            style={{
              color: "black",
            }}
          >
            Subscribe for ${price}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default PlanCard;
