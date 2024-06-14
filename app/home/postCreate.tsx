import { View, Text, SafeAreaView } from "react-native";
import React from "react";

type Props = {};

const postCreate = (props: Props) => {
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
        Post Create
      </Text>
    </SafeAreaView>
  );
};

export default postCreate;
