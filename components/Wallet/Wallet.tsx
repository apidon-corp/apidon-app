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

const wallet = () => {
  const pathname = usePathname();

  const { products } = useInAppPurchases();
  const { balance } = useBalance();

  const handlePressWithdrawButton = () => {
    const subScreens = pathname.split("/");

    const length = subScreens.length;

    subScreens[length - 1] = "withdraw";

    const path = subScreens.join("/");

    router.push(path);
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
      style={{ flex: 1 }}
      contentContainerStyle={{
        gap: 20,
        width: "100%",
      }}
      showsVerticalScrollIndicator={false}
    >
      <View
        id="balance-root"
        style={{
          width: "100%",
          backgroundColor: "#222222",
          padding: 25,
          borderRadius: 10,
        }}
      >
        <View
          id="balance-card"
          style={{
            width: "100%",
            gap: 20,
          }}
        >
          <View>
            <Text fontSize={18}>Balance</Text>

            <Text bold fontSize={48}>
              ${balance}
            </Text>
          </View>

          <View
            style={{
              justifyContent: "center",
              alignContent: "center",
            }}
          >
            <Refund />
          </View>

          <View
            id="withdraw"
            style={{
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Pressable
              onPress={handlePressWithdrawButton}
              style={{
                padding: 10,
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: 10,
              }}
            >
              <Text>Withdraw</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View
        id="top-up-root"
        style={{ justifyContent: "center", alignItems: "center", gap: 20 }}
      >
        <View
          id="title"
          style={{
            justifyContent: "center",
            alignItems: "center",
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
              gap: 10,
            }}
            columnWrapperStyle={{
              gap: 10,
            }}
            data={products}
            renderItem={({ item }) => (
              <TopUpProduct
                id={item.identifier}
                product={item}
                key={item.identifier}
              />
            )}
            numColumns={3}
            scrollEnabled={false}
            keyExtractor={(item) => item.identifier}
          />
        )}
      </View>
    </ScrollView>
  );
};

export default wallet;
