import { Pressable, View } from "react-native";
import { Text } from "@/components/Text/Text";

import React from "react";
import { WithdrawRequestDocData } from "@/types/Withdraw";
import { AntDesign } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";

type Props = {
  data: WithdrawRequestDocData;
};

const RequestPreviewObject = ({ data }: Props) => {
  const pathname = usePathname();

  const handlePressRequestPreview = () => {
    const subScreens = pathname.split("/");

    const length = subScreens.length;

    subScreens[
      length - 1
    ] = `withdrawRequest?withdrawRequestId=${data.requestId}`;

    const path = subScreens.join("/");

    router.push(path);
  };

  return (
    <Pressable
      onPress={handlePressRequestPreview}
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
          <Text fontSize={12} style={{ color: "gray" }}>
            Id
          </Text>
          <Text bold fontSize={13}>
            {data.requestId}
          </Text>
        </View>

        <View
          id="status"
          style={{
            width: "100%",
          }}
        >
          <Text fontSize={12} style={{ color: "gray" }}>
            Status
          </Text>
          <Text bold fontSize={14}>
            {data.status.toUpperCase()}
          </Text>
        </View>

        <View
          id="date"
          style={{
            width: "100%",
          }}
        >
          <Text fontSize={12} style={{ color: "gray" }}>
            Request Date
          </Text>
          <Text fontSize={13} bold>
            {new Date(data.requestedDate).toLocaleString()}
          </Text>
        </View>
      </View>
      <View id="arrow-area">
        <Pressable>
          <AntDesign name="right" size={24} color="white" />
        </Pressable>
      </View>
    </Pressable>
  );
};

export default RequestPreviewObject;
