import Frenlet from "@/components/Frenlet/Frenlet";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native";

const frenlet = () => {
  const { receiver, id } = useLocalSearchParams<{
    receiver: string;
    id: string;
  }>();

  if (!receiver || !id) return <></>;

  const frenletDocPath = `/users/${receiver}/frenlets/frenlets/incoming/${id}`;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Frenlet frenletDocPath={frenletDocPath} />
    </SafeAreaView>
  );
};

export default frenlet;
