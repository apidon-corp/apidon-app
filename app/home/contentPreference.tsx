import React from "react";
import { SafeAreaView, Text } from "react-native";

type Props = {};

const contentPreference = (props: Props) => {
  return (
    <SafeAreaView
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <Text
        style={{
          textAlign: "center",
          fontSize: 20,
          color: "white",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Content Preference
      </Text>
    </SafeAreaView>
  );
};

export default contentPreference;
