import { Text } from "@/components/Text/Text";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

import * as Progress from "react-native-progress";

import { useAuth } from "@/providers/AuthProvider";
import { CollectibleUsageDocData } from "@/types/CollectibleUsage";
import { PlanDocData } from "@/types/Plans";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

import * as Linking from "expo-linking";

const CurrentPlan = () => {
  const { authStatus } = useAuth();

  const [usageData, setUsageData] = useState<CollectibleUsageDocData | null>(
    null
  );

  const [currentPlanName, setCurrentPlanName] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus !== "authenticated") return;

    const displayName = auth().currentUser?.displayName;
    if (!displayName) return;

    const unsubscribe = firestore()
      .doc(`users/${displayName}/collectible/usage`)
      .onSnapshot((snapshot) => {
        if (!snapshot.exists) {
          console.error("No usage data found");
          return setUsageData(null);
        }

        const data = snapshot.data() as CollectibleUsageDocData;
        if (!data) {
          console.error("Undefined usage data found");
          return setUsageData(null);
        }

        setUsageData(data);
      });

    return () => {
      unsubscribe();
    };
  }, [authStatus]);

  // Getting Plan Details
  useEffect(() => {
    handleGetPlanDetails();
  }, [usageData]);

  // Especially to get plan name..
  // Can a bit overkill
  const handleGetPlanDetails = async () => {
    if (!usageData || !usageData.planId) return setCurrentPlanName(null);

    const planDoc = await firestore().doc(`plans/${usageData.planId}`).get();

    if (!planDoc.exists) {
      console.error("Plan not found on database");
      return setCurrentPlanName(null);
    }

    const data = planDoc.data() as PlanDocData;

    if (!data) {
      console.error("Plan data is undefined");
      return setCurrentPlanName(null);
    }

    setCurrentPlanName(data.title);
  };

  const handlePressCancelSubscriptionButton = () => {
    Linking.openURL("https://support.apple.com/en-us/118428");
  };

  if (!usageData || !currentPlanName) {
    return (
      <View
        style={{
          width: "100%",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="small" color="white" />
      </View>
    );
  }

  return (
    <View
      id="root"
      style={{
        width: "100%",
        flex: 1,
        padding: 15,
        gap: 15,
        alignItems: "center",
      }}
    >
      <View
        id="title"
        style={{
          width: "100%",
        }}
      >
        <Text fontSize={18} bold>
          {currentPlanName} Plan Usage
        </Text>
      </View>

      <View
        id="collectible-remaining-limit"
        style={{
          width: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          padding: 10,
          borderRadius: 10,
          gap: 15,
        }}
      >
        <Text bold>Created Collectibles</Text>

        <View style={{ width: "100%" }}>
          <View
            id="total"
            style={{ flexDirection: "row", gap: 5, alignItems: "center" }}
          >
            <Text>Total:</Text>
            <Text>{usageData.limit}</Text>
          </View>

          <View
            id="used"
            style={{ flexDirection: "row", gap: 5, alignItems: "center" }}
          >
            <Text>Used:</Text>
            <Text>{usageData.used}</Text>
          </View>

          <View
            id="remaining"
            style={{ flexDirection: "row", gap: 5, alignItems: "center" }}
          >
            <Text>Remaining:</Text>
            <Text>{usageData.limit - usageData.used}</Text>
          </View>
        </View>

        <View id="usage-bar" style={{ width: "100%", gap: 10 }}>
          <Text bold>
            Usage: {((usageData.used / usageData.limit) * 100).toFixed(1)}%
          </Text>
          <Progress.Bar
            progress={usageData.used / usageData.limit}
            width={null}
            color="white"
          />
        </View>
      </View>

      {usageData.planId === "free" && (
        <View
          id="info-panel"
          style={{
            width: "100%",
            backgroundColor: "rgba(255,255,0,0.35)",
            padding: 10,
            borderRadius: 10,
            gap: 5,
          }}
        >
          <Text bold>Important Notice</Text>
          <Text fontSize={12}>
            Please note that your plan usage will not reset at the end of the
            current period. If you've reached your limits, you'll need to
            upgrade to a higher plan to continue enjoying our services without
            interruptions.
          </Text>
        </View>
      )}

      {usageData.planId !== "free" && (
        <View
          id="info-panel"
          style={{
            width: "100%",
            backgroundColor: "rgba(0,255,0,0.3)",
            padding: 10,
            borderRadius: 10,
            gap: 5,
          }}
        >
          <Text bold>Important Notice</Text>
          <Text fontSize={12}>
            Your plan usage will reset at the start of each new billing period.
            This means you'll get a fresh allowance of all your plan's features,
            so you can continue enjoying our services without any interruptions.
          </Text>
        </View>
      )}

      {usageData.planId !== "free" && (
        <Pressable
          onPress={handlePressCancelSubscriptionButton}
          style={{
            width: "75%",
            backgroundColor: "red",
            padding: 10,
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text bold>Cancel Subscription</Text>
        </Pressable>
      )}
    </View>
  );
};

export default CurrentPlan;
