import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import { Text } from "@/components/Text/Text";

import TopUpProduct from "@/components/Wallet/TopUp/TopUpProduct";
import { useBalance } from "@/hooks/useBalance";
import { useInAppPurchases } from "@/hooks/useInAppPurchases";
import Refund from "./Refund";
import { router, usePathname } from "expo-router";
import { AntDesign, Entypo, Feather, Ionicons } from "@expo/vector-icons";

import * as Linking from "expo-linking";
import TopUpArea from "./TopUp/TopUpArea";

const wallet = () => {
  const pathname = usePathname();

  const { balance } = useBalance();

  const handlePressWithdrawButton = () => {
    const subScreens = pathname.split("/");

    const length = subScreens.length;

    subScreens[length - 1] = "withdraw";

    const path = subScreens.join("/");

    router.push(path);
  };

  const handlePressRefundButton = () => {
    Linking.openURL("https://support.apple.com/en-us/118223");
  };

  if (balance === "error" || balance === "getting-balance") {
    return (
      <View
        style={{
          width: "100%",
          flex: 1,
          alignContent: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="gray" />
      </View>
    );
  }

  return (
    <ScrollView
      id="root"
      contentContainerStyle={{
        width: "100%",
        gap: 10
      }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          width: "100%",
          gap: 20,
          padding: 15,
        }}
      >
        <View id="balance">
          <Text fontSize={16}>Total Balance</Text>

          <Text bold fontSize={48}>
            ${balance}
          </Text>
        </View>

        <View
          id="methods"
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View
            id="receipts"
            style={{
              width: "25%",
              aspectRatio: 1,
              borderColor: "gray",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.07)",
              borderRadius: 15,
              gap: 10,
            }}
          >
            <Ionicons name="receipt-outline" size={28} color="white" />

            <Text
              bold
              style={{
                color: "gray",
              }}
              fontSize={12}
            >
              Receipts
            </Text>
          </View>

          <Pressable
            onPress={handlePressWithdrawButton}
            id="withdraw"
            style={{
              width: "25%",
              aspectRatio: 1,
              borderColor: "gray",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.07)",
              borderRadius: 15,
              gap: 10,
            }}
          >
            <AntDesign
              name="arrowup"
              size={28}
              color="white"
              style={{
                transform: [{ rotate: "45deg" }],
              }}
            />

            <Text
              bold
              style={{
                color: "gray",
              }}
              fontSize={12}
            >
              Withdraw
            </Text>
          </Pressable>

          <Pressable
            onPress={handlePressRefundButton}
            id="refund"
            style={{
              width: "25%",
              aspectRatio: 1,
              borderColor: "gray",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.07)",
              borderRadius: 15,
              gap: 10,
            }}
          >
            <AntDesign name="shrink" size={28} color="white" />

            <Text
              bold
              style={{
                color: "gray",
              }}
              fontSize={12}
            >
              Refund
            </Text>
          </Pressable>
        </View>
      </View>

      <TopUpArea />
    </ScrollView>
  );
};

export default wallet;
