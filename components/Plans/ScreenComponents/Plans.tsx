import CustomBottomModalSheet from "@/components/BottomSheet/CustomBottomModalSheet";
import PlanBottomSheetContent from "@/components/Plans/PlanBottomSheetContent";
import PlanCard from "@/components/Plans/PlanCard";
import Text from "@/components/Text/Text";
import { useInAppPurchases } from "@/hooks/useInAppPurchases";
import { useAuth } from "@/providers/AuthProvider";
import { BottomSheetModalData, PlanCardData, PlanDocData } from "@/types/Plans";
import { AntDesign } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router, usePathname } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, Pressable, View } from "react-native";

import Carousel from "react-native-reanimated-carousel";

import { SubscriptionDocData } from "@/types/Subscriptions";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

const Plans = () => {
  const pathname = usePathname();

  const { authStatus } = useAuth();

  const { width } = Dimensions.get("window");

  const planInformationBottomSheetModalRef = useRef<BottomSheetModal>(null);

  const [bottomSheetData, setBottomSheetData] = useState<BottomSheetModalData>({
    description: "",
    title: "",
  });

  const { subscriptions } = useInAppPurchases();
  const [planCardDatas, setPlanCardDatas] = useState<PlanCardData[]>([]);
  const [currentSubscriptionData, setCurrentSubscriptionData] = useState<
    SubscriptionDocData | "not-subscribed" | null
  >(null);

  const [currentPlanName, setCurrentPlanName] = useState("Free");

  useEffect(() => {
    handlePreparePlanCardDatas();
  }, [subscriptions]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    if (subscriptions.length === 0) return;

    const displayName = auth().currentUser?.displayName;
    if (!displayName) return;

    const unsubscribe = firestore()
      .collection(`users/${displayName}/subscriptions`)
      .where("isActive", "==", true)
      .onSnapshot((snapshot) => {
        if (snapshot.size > 1) {
          console.error("More than one active subscription found");
          return;
        }

        if (snapshot.size === 0) {
          console.log("No active subscriptions found");
          return setCurrentSubscriptionData("not-subscribed");
        }

        const data = snapshot.docs[0].data() as SubscriptionDocData;

        if (!data) {
          console.error("Undefined subscription data found");
          return setCurrentSubscriptionData(null);
        }

        // For simulator envrionments
        if (Date.now() > data.expirationTs) {
          console.error(
            "Subscription expired but still on our database as active. (In simulator it is normal.) Please update subscription doc on Firebase as isActive field to false."
          );
          return setCurrentSubscriptionData(null);
        }

        return setCurrentSubscriptionData(data);
      });

    return () => {
      unsubscribe();
    };
  }, [authStatus, subscriptions.length]);

  // Getting current plan details
  useEffect(() => {
    if (!currentSubscriptionData) return setCurrentPlanName("Free");
    if (currentSubscriptionData === "not-subscribed")
      return setCurrentPlanName("Free");

    if (!planCardDatas.length) return setCurrentPlanName("Free");

    const currentCardData = planCardDatas.find(
      (c) => c.storeProductId === currentSubscriptionData.productId
    );

    if (!currentCardData) return setCurrentPlanName("Free");

    setCurrentPlanName(currentCardData.title);
  }, [currentSubscriptionData, planCardDatas]);

  const handleGetPlanDetailFromDatabase = async (storeProductId: string) => {
    try {
      const planDocSnapshot = await firestore()
        .doc(`plans/${storeProductId}`)
        .get();

      if (!planDocSnapshot.exists) {
        console.error("Plan doc not found");
        return false;
      }

      const data = planDocSnapshot.data() as PlanDocData;

      if (!data) {
        console.error("Undefined plan doc data");
        return false;
      }

      return data;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const handlePreparePlanCardDatas = async () => {
    if (!subscriptions.length) return setPlanCardDatas([]);

    const planCardDatasPrepared: PlanCardData[] = [];

    for (const subscription of subscriptions) {
      const planDetailData = await handleGetPlanDetailFromDatabase(
        subscription.identifier
      );
      if (!planDetailData) continue;

      const planCardData: PlanCardData = {
        ...planDetailData,
        purchaseStoreProduct: subscription,
      };

      planCardDatasPrepared.push(planCardData);
    }

    // Free Plan Getting
    const freePlanDetailData = await handleGetPlanDetailFromDatabase("free");
    if (freePlanDetailData)
      planCardDatasPrepared.push({
        ...freePlanDetailData,
        purchaseStoreProduct: null,
      });

    planCardDatasPrepared.sort((a, b) => a.price.price - b.price.price);

    setPlanCardDatas(planCardDatasPrepared);
  };

  const handlePressCurrentPlan = () => {
    const subScreens = pathname.split("/");

    const length = subScreens.length;

    subScreens[length - 1] = "currentPlan";

    const path = subScreens.join("/");

    router.push(path);
  };

  if (!currentSubscriptionData || !planCardDatas.length) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="small" color="white" />
      </View>
    );
  }

  return (
    <>
      <View
        style={{
          padding: 15,
          gap: 15,
          flex: 1,
        }}
      >
        <Pressable
          onPress={handlePressCurrentPlan}
          id="current-plan-area"
          style={{
            width: "100%",
            backgroundColor: "rgba(255,255,255,0.05)",
            padding: 15,
            borderRadius: 20,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View id="plan-name">
            <Text>Current Plan</Text>
            <Text fontSize={16} bold>
              {currentPlanName}
            </Text>
          </View>

          <AntDesign name="right" size={24} color="white" />
        </Pressable>

        <Carousel
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
          data={planCardDatas}
          renderItem={({ item }) => (
            <PlanCard
              currentSubscriptionProductId={
                currentSubscriptionData === "not-subscribed"
                  ? "free"
                  : currentSubscriptionData.productId
              }
              planCardData={item}
              bottomSheetModalRef={planInformationBottomSheetModalRef}
              setBottomSheetData={setBottomSheetData}
            />
          )}
          width={width * 0.9}
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

export default Plans;
