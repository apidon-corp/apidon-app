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
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Pressable,
  View,
} from "react-native";
import Purchases from "react-native-purchases";

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

  // User's subscription data from database.
  const [currentSubscriptionData, setCurrentSubscriptionData] = useState<
    SubscriptionDocData | "not-subscribed" | null
  >(null);

  // Current Plan Card Data that user subscribed before.
  const [currentPlanCardData, setCurrentPlanCardData] =
    useState<PlanCardData | null>(null);

  // Current Index of Carousel.
  const [currentIndex, setCurrentIndex] = useState(0);

  // Current Plan Data in User's view
  const [planCardDataInView, setPlanCardDataInView] =
    useState<PlanCardData | null>(null);

  const subscribeButtonOpacityValue = useRef(new Animated.Value(0)).current;

  const [showSubscribeButton, setShowSubscribeButton] = useState(false);

  const [subscriptionButtonLoading, setSubscriptionButtonLoading] =
    useState(false);

  useEffect(() => {
    handlePreparePlanCardDatas();
  }, [subscriptions]);

  // Getting user's subscription data from database / realtime.
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
    if (!currentSubscriptionData) return setCurrentPlanCardData(null);
    if (currentSubscriptionData === "not-subscribed") {
      // Free Card Data Getting
      const currentCardData = planCardDatas.find(
        (c) => c.storeProductId === ""
      );
      return setCurrentPlanCardData(currentCardData || null);
    }

    if (!planCardDatas.length) return setCurrentPlanCardData(null);

    const currentCardData = planCardDatas.find(
      (c) => c.storeProductId === currentSubscriptionData.productId
    );

    if (!currentCardData) return setCurrentPlanCardData(null);

    setCurrentPlanCardData(currentCardData);
  }, [currentSubscriptionData, planCardDatas]);

  // Finding what plan user is looking.
  useEffect(() => {
    if (!currentPlanCardData || currentIndex === -1 || !planCardDatas.length)
      return setPlanCardDataInView(null);

    const planCardInViewFounded = planCardDatas[currentIndex];
    if (!planCardInViewFounded) return setPlanCardDataInView(null);

    setPlanCardDataInView(planCardInViewFounded);
  }, [currentPlanCardData, currentIndex, planCardDatas]);

  // Define if subscription button should be showed
  useEffect(() => {
    let show = true;

    if (planCardDataInView?.price.price === 0) {
      show = false;
    } else if (!currentPlanCardData || !planCardDataInView) {
      show = false;
    } else if (
      planCardDataInView.storeProductId === currentPlanCardData.storeProductId
    ) {
      show = false;
    }

    setShowSubscribeButton(show);
  }, [planCardDataInView, currentPlanCardData]);

  // Change Opacity...
  useEffect(() => {
    if (!showSubscribeButton) {
      return handleChangeOpactiy(subscribeButtonOpacityValue, 0, 250);
    }

    return handleChangeOpactiy(subscribeButtonOpacityValue, 1, 250);
  }, [showSubscribeButton, subscriptionButtonLoading]);

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

  const handleSubscribeButton = async () => {
    if (!showSubscribeButton) return;

    if (!planCardDatas.length) return;

    if (subscriptionButtonLoading) return;

    const storeProduct = planCardDatas[currentIndex].purchaseStoreProduct;
    if (!storeProduct) return console.error("Undefined store product");

    setSubscriptionButtonLoading(true);

    try {
      await Purchases.purchaseStoreProduct(storeProduct);

      setSubscriptionButtonLoading(false);
      setShowSubscribeButton(false);
    } catch (error: any) {
      if (error.userCancelled) return setSubscriptionButtonLoading(false);

      Alert.alert("Error", "Error on purchasing product.");

      console.error("Error purchasing product: \n", storeProduct, "\n", error);
      console.error("Error on purchasing:", error);

      setSubscriptionButtonLoading(false);
    }
  };

  const handleChangeOpactiy = (
    animatedObject: Animated.Value,
    toValue: number,
    duration: number
  ) => {
    Animated.timing(animatedObject, {
      toValue,
      duration,
      useNativeDriver: true,
    }).start();
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
          // To prevent shadow on navigation back.
          overflow: "hidden",
          gap: 15,
          flex: 1,
          alignItems: "center",
        }}
      >
        <View style={{ paddingHorizontal: 15, paddingTop: 15 }}>
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
                {currentPlanCardData?.title || "Free"}
              </Text>
            </View>

            <AntDesign name="right" size={24} color="white" />
          </Pressable>
        </View>

        <Carousel
          style={{
            overflow: "visible",
            alignItems: "center",
            justifyContent: "center",
          }}
          data={planCardDatas}
          renderItem={({ index, item }) => {
            return (
              <PlanCard
                planCardData={item}
                bottomSheetModalRef={planInformationBottomSheetModalRef}
                setBottomSheetData={setBottomSheetData}
                index={index}
                currentIndex={currentIndex}
              />
            );
          }}
          // Padding-Like witdh
          width={width - 15 * 2}
          loop={false}
          onSnapToItem={(index) => setCurrentIndex(index)}
          enabled={!subscriptionButtonLoading}
        />
      </View>

      <Animated.View
        style={{
          opacity: subscribeButtonOpacityValue,
          display: showSubscribeButton ? "flex" : "none",
        }}
      >
        <Pressable
          onPress={handleSubscribeButton}
          id="buy-button-area"
          style={{
            zIndex: 10,
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: 85,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.6)",
            padding: 15,
          }}
        >
          <View
            style={{
              height: 45,
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "white",
              borderRadius: 20,
            }}
          >
            {subscriptionButtonLoading ? (
              <ActivityIndicator size="small" color="black" />
            ) : (
              <Text bold fontSize={16} style={{ color: "black" }}>
                Subscribe for ${planCardDataInView?.price.price || "ERROR"}
              </Text>
            )}
          </View>
        </Pressable>
      </Animated.View>

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
