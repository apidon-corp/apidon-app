import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import Text from "@/components/Text/Text";
import { AntDesign } from "@expo/vector-icons";

import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { useAuth } from "@/providers/AuthProvider";
import { WithdrawRequestDocData } from "@/types/Withdraw";
import { router, usePathname } from "expo-router";
import RequestPreviewObject from "@/components/Wallet/Withdraw/RequestPreviewObject";

const Withdraw = () => {
  const { authStatus } = useAuth();

  const [requestDatas, setRequestDatas] = useState<
    WithdrawRequestDocData[] | null
  >(null);

  const pathname = usePathname();

  useEffect(() => {
    if (authStatus !== "authenticated") return;

    const displayName = auth().currentUser?.displayName || "";
    if (!displayName) return;

    const unsubscribe = firestore()
      .collection(`payouts/requests/${displayName}`)
      .onSnapshot(
        (snapshot) => {
          const datas = snapshot.docs.map((s) =>
            s.data()
          ) as WithdrawRequestDocData[];

          setRequestDatas(
            datas.sort((a, b) => b.requestedDate - a.requestedDate)
          );
        },
        (error) => {
          console.error(error);
          setRequestDatas(null);
        }
      );

    return () => {
      unsubscribe();
    };
  }, [authStatus]);

  const handlePressRequestWithdrawButton = () => {
    const subScreens = pathname.split("/");

    const length = subScreens.length;

    subScreens[length - 1] = "requestWithdraw";

    const path = subScreens.join("/");

    router.push(path);
  };

  if (!requestDatas) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="white" size="small" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 15, gap: 25 }}>
      <View
        id="request-withdraw-root"
        style={{
          width: "100%",
        }}
      >
        <Pressable
          onPress={handlePressRequestWithdrawButton}
          style={{
            width: "100%",
            backgroundColor: "rgba(255,255,255,0.06)",
            padding: 15,
            borderRadius: 20,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text>Request Withdraw</Text>

          <AntDesign name="right" size={24} color="white" />
        </Pressable>
      </View>

      <View
        id="requests-root"
        style={{
          width: "100%",
          gap: 15,
        }}
      >
        <Text fontSize={18} bold>
          Requests
        </Text>

        <FlatList
          contentContainerStyle={{
            gap: 10,
          }}
          scrollEnabled={false}
          data={requestDatas}
          renderItem={({ item }) => (
            <RequestPreviewObject data={item} key={item.requestId} />
          )}
          keyExtractor={(item) => item.requestId}
        />
      </View>
    </ScrollView>
  );
};

export default Withdraw;
