import { Pressable, View } from "react-native";
import { Text } from "@/components/Text/Text";

import React from "react";
import { WithdrawRequestDocData } from "@/types/Withdraw";
import { AntDesign } from "@expo/vector-icons";

type Props = {
  data: WithdrawRequestDocData;
};

const RequestPreviewObject = ({ data }: Props) => {
  return (
    <View
      style={{
        width: "100%",
        borderRadius: 15,
        padding: 10,
        backgroundColor: "rgba(255,255,255,0.1)",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View style={{ gap: 5 }}>
        <View
          id="id"
          style={{
            width: "100%",
          }}
        >
          <Text fontSize={12} bold style={{ color: "gray" }}>
            Id
          </Text>
          <Text fontSize={12}>{data.requestId}</Text>
        </View>

        <View
          id="status"
          style={{
            width: "100%",
          }}
        >
          <Text bold fontSize={12} style={{ color: "gray" }}>
            Status
          </Text>
          <Text fontSize={12}>{data.status}</Text>
        </View>

        <View
          id="date"
          style={{
            width: "100%",
          }}
        >
          <Text bold fontSize={12} style={{ color: "gray" }}>
            Request Date
          </Text>
          <Text fontSize={12}>
            {new Date(data.requestedDate).toLocaleString()}
          </Text>
        </View>
      </View>
      <View id="arrow-area">
        <Pressable>
          <AntDesign name="right" size={24} color="white" />
        </Pressable>
      </View>
    </View>
  );
};

export default RequestPreviewObject;
