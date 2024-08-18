import CustomBottomModalSheet from "@/components/BottomSheet/CustomBottomModalSheet";
import PlanBottomSheetContent from "@/components/Plans/PlanBottomSheetContent";
import PlanCard from "@/components/Plans/PlanCard";
import Text from "@/components/Text/Text";
import { useInAppPurchases } from "@/hooks/useInAppPurchases";
import { BubbleId, PlanCardData } from "@/types/Plans";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { useRef, useState } from "react";
import { Dimensions, View } from "react-native";

import Carousel from "react-native-reanimated-carousel";

const planCardDatas: PlanCardData[] = [
  {
    title: "Free",
    canCollectSoldOutItems: false,
    collectibleLimit: 5,
    stockLimit: 10,
    price: "free",
  },
  {
    title: "Collector",
    canCollectSoldOutItems: true,
    collectibleLimit: 10,
    stockLimit: 20,
    price: 10,
  },
  {
    title: "Creator",
    canCollectSoldOutItems: true,
    collectibleLimit: 50,
    stockLimit: 100,
    price: 20,
  },
  {
    title: "Visioner",
    canCollectSoldOutItems: true,
    collectibleLimit: 500,
    stockLimit: 1000,
    price: 30,
  },
];

const plans = () => {
  const { width } = Dimensions.get("window");

  const planInformationBottomSheetModalRef = useRef<BottomSheetModal>(null);

  const [informationBubbleId, setInformationBubbleId] =
    useState<BubbleId>("collect-sold-out");

  const { subscriptions } = useInAppPurchases();

  console.log(subscriptions);

  return (
    <>
      <View
        style={{
          padding: 15,
          gap: 15,
          flex: 1,
        }}
      >
        <View
          id="current-plan-area"
          style={{
            width: "100%",
            backgroundColor: "rgba(255,255,255,0.05)",
            padding: 15,
            borderRadius: 20,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text fontSize={16}>Current Plan</Text>
          <Text fontSize={16} bold>
            Free
          </Text>
        </View>

        <Carousel
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
          data={planCardDatas}
          renderItem={({ item }) => (
            <PlanCard
              planCardData={item}
              bottomSheetModalRef={planInformationBottomSheetModalRef}
              setInformationBubbleId={setInformationBubbleId}
            />
          )}
          width={width * 0.85}
          loop={false}
        />
      </View>

      <CustomBottomModalSheet
        ref={planInformationBottomSheetModalRef}
        snapPoint="40%"
        backgroundColor="#1B1B1B"
      >
        <PlanBottomSheetContent detailId={informationBubbleId} />
      </CustomBottomModalSheet>
    </>
  );
};

export default plans;
