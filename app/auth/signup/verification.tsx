import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {};

const verification = (props: Props) => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <Text style={{ color: "white" }}>verification</Text>
    </SafeAreaView>
  );
};

export default verification;
