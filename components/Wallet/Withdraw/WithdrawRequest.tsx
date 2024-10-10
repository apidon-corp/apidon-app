import { ActivityIndicator, ScrollView, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import Text from "@/components/Text/Text";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { useAuth } from "@/providers/AuthProvider";
import { WithdrawRequestDocData } from "@/types/Withdraw";

const WithdrawRequest = () => {
  const { withdrawRequestId } = useLocalSearchParams<{
    withdrawRequestId: string;
  }>();

  const { authStatus } = useAuth();

  const [withdrawRequestData, setWithdrawRequestData] =
    useState<WithdrawRequestDocData | null>(null);

  useEffect(() => {
    if (authStatus !== "authenticated") return;

    const displayName = auth().currentUser?.displayName || "";
    if (!displayName) return;

    const unsubscribe = firestore()
      .doc(`payouts/requests/${displayName}/${withdrawRequestId}`)
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) return setWithdrawRequestData(null);

          const data = snapshot.data() as WithdrawRequestDocData;
          if (!data) return setWithdrawRequestData(null);

          return setWithdrawRequestData(data);
        },
        (error) => {
          console.error(error);
          setWithdrawRequestData(null);
        }
      );
    return () => unsubscribe();
  }, [authStatus]);

  if (!withdrawRequestId) {
    return (
      <View
        style={{
          flex: 1,
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Request not found.</Text>
      </View>
    );
  }

  if (!withdrawRequestData) {
    return (
      <View
        style={{
          flex: 1,
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color="white" size="small" />
      </View>
    );
  }

  return (
    <ScrollView
      id="root"
      contentContainerStyle={{
        width: "100%",
        padding: 15,
        gap: 15,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          width: "100%",
          backgroundColor: "rgba(255,255,255,0.06)",
          padding: 15,
          borderRadius: 20,
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
        }}
      >
        <Text>Status:</Text>
        <Text
          bold
          style={{
            color:
              withdrawRequestData.status === "pending"
                ? "yellow"
                : withdrawRequestData.status === "rejected"
                ? "red"
                : "green",
          }}
        >
          {withdrawRequestData.status.toUpperCase()}
        </Text>
      </View>

      <View
        id="general-information"
        style={{
          width: "100%",
          backgroundColor: "rgba(255,255,255,0.06)",
          padding: 15,
          borderRadius: 20,
          alignItems: "center",
          gap: 10,
        }}
      >
        <View id="id" style={{ width: "100%" }}>
          <Text fontSize={13} style={{ color: "gray" }}>
            Id
          </Text>
          <Text bold>{withdrawRequestData.requestId}</Text>
        </View>

        <View id="date" style={{ width: "100%" }}>
          <Text fontSize={13} style={{ color: "gray" }}>
            Date
          </Text>
          <Text bold>
            {new Date(withdrawRequestData.requestedDate).toLocaleString()}
          </Text>
        </View>

        <View id="amount-before-fee" style={{ width: "100%" }}>
          <Text fontSize={13} style={{ color: "gray" }}>
            Amount (Before Fees){" "}
          </Text>
          <Text bold>{withdrawRequestData.requestedAmount}</Text>
        </View>

        <View id="amount-after-fee" style={{ width: "100%" }}>
          <Text fontSize={13} style={{ color: "gray" }}>
            Total (After Fees)
          </Text>
          <Text bold>{withdrawRequestData.requestedAmount * 0.6 - 20}</Text>
        </View>

        <View id="currency" style={{ width: "100%" }}>
          <Text fontSize={13} style={{ color: "gray" }}>
            Currency
          </Text>
          <Text bold>{withdrawRequestData.currency}</Text>
        </View>
      </View>

      <View
        id="bank-information"
        style={{
          width: "100%",
          backgroundColor: "rgba(255,255,255,0.06)",
          padding: 15,
          borderRadius: 20,
          alignItems: "center",
          gap: 10,
        }}
      >
        <View id="bank-name" style={{ width: "100%" }}>
          <Text fontSize={13} style={{ color: "gray" }}>
            Bank Name
          </Text>
          <Text bold>{withdrawRequestData.bankDetails.bankName}</Text>
        </View>

        <View id="account-name" style={{ width: "100%" }}>
          <Text fontSize={13} style={{ color: "gray" }}>
            Swift Code
          </Text>
          <Text bold>{withdrawRequestData.bankDetails.swiftCode}</Text>
        </View>

        <View id="account-number" style={{ width: "100%" }}>
          <Text fontSize={13} style={{ color: "gray" }}>
            Account Number or IBAN
          </Text>
          <Text bold>{withdrawRequestData.bankDetails.accountNumber}</Text>
        </View>

        <View
          id="routing-number"
          style={{
            width: "100%",
            display: withdrawRequestData.bankDetails.routingNumber
              ? undefined
              : "none",
          }}
        >
          <Text fontSize={13} style={{ color: "gray" }}>
            Routing Number
          </Text>
          <Text bold>{withdrawRequestData.bankDetails.routingNumber}</Text>
        </View>
      </View>

      <View
        id="notes"
        style={{
          width: "100%",
          backgroundColor: "rgba(255,255,255,0.06)",
          padding: 15,
          borderRadius: 20,
          alignItems: "center",
          gap: 10,
        }}
      >
        <View id="notes" style={{ width: "100%" }}>
          <Text fontSize={13} style={{ color: "gray" }}>
            Notes
          </Text>
          <Text bold>{withdrawRequestData.notes}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default WithdrawRequest;
