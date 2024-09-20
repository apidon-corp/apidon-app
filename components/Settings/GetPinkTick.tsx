import { Text } from "@/components/Text/Text";
import { apidonPink } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";

const GetPinkTick = () => {
  const handlePressButton = () => {
    router.push("/(modals)/settings/getPinkTick");
  };

  return (
    <Pressable
      onPress={handlePressButton}
      style={{
        padding: 15,
        borderWidth: 1,
        borderColor: "gray",
        borderRadius: 10,
        width: "100%",
        gap: 5,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
        <Text bold style={{ fontSize: 14, color: "white" }}>
          Get Pink Tick
        </Text>
        <MaterialIcons name="verified" size={18} color={apidonPink} />
      </View>

      <Text style={{ fontSize: 12, color: "gray" }} bold>
        Apply for your Pink Tick to start creating and selling exclusive digital
        items. Become a recognized creator on the platform!
      </Text>
    </Pressable>
  );
};

export default GetPinkTick;
