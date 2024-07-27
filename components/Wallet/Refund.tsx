import { Text } from "@/components/Text/Text";
import { FontAwesome5 } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, Pressable } from "react-native";

import * as Linking from "expo-linking";

const Refund = () => {
  const [loading, setLoading] = useState(false);

  const handleRestorePurchasesButton = async () => {
    if (loading) return;

    setLoading(true);

    try {
      await Linking.openURL("https://support.apple.com/en-us/118223");
    } catch (error) {
      console.error("Error opening URL:", error);
    }

    setLoading(false);
  };

  return (
    <Pressable
      disabled={loading}
      onPress={handleRestorePurchasesButton}
      style={{
        flexDirection: "row",
        borderWidth: 1,
        borderColor: "gray",
        borderRadius: 10,
        padding: 10,
        paddingHorizontal: 15,
        alignItems: "center",
        gap: 10,
      }}
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          <FontAwesome5 name="hand-holding-usd" size={18} color="white" />
          <Text>Request Refund</Text>
        </>
      )}
    </Pressable>
  );
};

export default Refund;
