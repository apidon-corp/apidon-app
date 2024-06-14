import { View, Text, Button, SafeAreaView } from "react-native";
import React from "react";
import { auth } from "@/firebase/client";

type Props = {};

const index = (props: Props) => {
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
        Main Page
      </Text>
      <Button
        title="Sign Out"
        onPress={() => {
          auth.signOut();
        }}
      />
    </SafeAreaView>
  );
};

export default index;
