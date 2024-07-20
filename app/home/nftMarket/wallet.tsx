import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import { Text } from "@/components/Text/Text";
import { useAuth } from "@/providers/AuthProvider";
import { BalanceDocData } from "@/types/Wallet";
import { FontAwesome5, FontAwesome6 } from "@expo/vector-icons";

import TopUpProduct from "@/components/Wallet/TopUp/TopUpProduct";
import IapService from "@/iap/iap";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

const wallet = () => {
  const authStatus = useAuth();

  const [balanceData, setBalanceData] = useState<BalanceDocData | null>(null);
  const { products } = IapService();

  useEffect(() => {
    if (authStatus !== "authenticated") return;

    const currentUserDisplayName = auth().currentUser?.displayName;
    if (!currentUserDisplayName) return;

    const subscribe = firestore()
      .doc(`users/${currentUserDisplayName}/wallet/balance`)
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) {
            console.error("Balance document does not exist");
            return setBalanceData(null);
          }

          const balanceDocData = snapshot.data() as BalanceDocData;

          if (!balanceDocData) {
            console.error("Balance data is null");
            return setBalanceData(null);
          }

          setBalanceData(balanceDocData);
        },
        (error) => {
          console.error("Error on fetching balance data: ", error);
        }
      );

    return () => subscribe();
  }, [authStatus]);

  const handlePressPlusButton = () => {
    router.push("/home/nftMarket/topUp");
  };

  if (!balanceData) {
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
          padding: 15,
          borderRadius: 10,
        }}
      >
        <View
          id="balance-card"
          style={{
            width: "100%",
            backgroundColor: "#333333",
            padding: 20,
            gap: 10,
            borderRadius: 15,
          }}
        >
          <Text fontSize={18}>Balance</Text>

          <Text bold fontSize={48}>
            ${balanceData.balance}
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignContent: "center",
              gap: 10,
            }}
          >
            <Pressable
              style={{
                flexDirection: "row",
                borderWidth: 1,
                borderColor: "gray",
                borderRadius: 10,
                padding: 10,
                paddingHorizontal: 15,
                alignItems: "center",
                gap: 10,
              }}
            >
              <FontAwesome6
                name="money-bill-transfer"
                size={18}
                color="white"
              />
              <Text>Send</Text>
            </Pressable>
            <Pressable
              style={{
                flexDirection: "row",
                borderWidth: 1,
                borderColor: "gray",
                borderRadius: 10,
                padding: 10,
                paddingHorizontal: 15,
                alignItems: "center",
                gap: 10,
              }}
            >
              <FontAwesome5 name="hand-holding-usd" size={18} color="white" />
              <Text>Request</Text>
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

        <FlatList
          contentContainerStyle={{
            gap: 10,
          }}
          columnWrapperStyle={{
            gap: 10,
          }}
          data={products}
          renderItem={({ item }) => <TopUpProduct id={item.id} key={item.id} />}
          numColumns={3}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
        />
      </View>
    </ScrollView>
  );
};

export default wallet;
