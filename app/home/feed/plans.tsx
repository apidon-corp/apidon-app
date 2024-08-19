import CustomBottomModalSheet from "@/components/BottomSheet/CustomBottomModalSheet";
import PlanBottomSheetContent from "@/components/Plans/PlanBottomSheetContent";
import PlanCard from "@/components/Plans/PlanCard";
import Text from "@/components/Text/Text";
import { useInAppPurchases } from "@/hooks/useInAppPurchases";
import {
  BottomSheetModalData,
  PlanCardData,
  SubscriptionIdentifiers,
  collectorPlanCardData,
  creatorPlanCardData,
  freePlanCardData,
  visionaryPlanCardData,
} from "@/types/Plans";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, View } from "react-native";

import Carousel from "react-native-reanimated-carousel";

const plans = () => {
  const { width } = Dimensions.get("window");

  const planInformationBottomSheetModalRef = useRef<BottomSheetModal>(null);

  const [bottomSheetData, setBottomSheetData] = useState<BottomSheetModalData>({
    description: "",
    title: "",
  });

  const { subscriptions } = useInAppPurchases();

  const [planCardDatas, setPlanCardDatas] = useState<PlanCardData[]>([]);

  useEffect(() => {
    const planCardDatasFetched: PlanCardData[] = [];

    for (const subscription of subscriptions) {
      let planCardData: PlanCardData | null = null;

      const identifier = subscription.identifier as SubscriptionIdentifiers;

      if (identifier === "dev_apidon_collector_10_1m")
        planCardData = {
          ...collectorPlanCardData,
          purchaseStoreProduct: subscription,
        };

      if (identifier === "dev_apidon_creator_10_1m")
        planCardData = {
          ...creatorPlanCardData,
          purchaseStoreProduct: subscription,
        };

      if (identifier === "dev_apidon_visionary_10_1m")
        planCardData = {
          ...visionaryPlanCardData,
          purchaseStoreProduct: subscription,
        };

      if (planCardData) planCardDatasFetched.push(planCardData);
    }

    const freePlanCardDataFetched = freePlanCardData;

    planCardDatasFetched.push(freePlanCardDataFetched);

    planCardDatasFetched.sort((a, b) => a.price - b.price);

    setPlanCardDatas(planCardDatasFetched);
  }, [subscriptions]);

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
              setBottomSheetData={setBottomSheetData}
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
        <PlanBottomSheetContent
          description={bottomSheetData.description}
          title={bottomSheetData.title}
        />
      </CustomBottomModalSheet>
    </>
  );
};

export default plans;
