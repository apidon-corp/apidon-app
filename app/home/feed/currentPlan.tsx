import { View } from "react-native";
import { Text } from "@/components/Text/Text";
import React from "react";

import * as Progress from "react-native-progress";

const currentPlan = () => {
  return (
    <View
      id="root"
      style={{
        width: "100%",
        flex: 1,
        padding: 15,
        gap: 15,
      }}
    >
      <View
        id="title"
        style={{
          width: "100%",
        }}
      >
        <Text fontSize={18} bold>
          Free Plan Usage
        </Text>
      </View>

      <View
        id="collectible-remaining-limit"
        style={{
          width: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          padding: 10,
          borderRadius: 10,
          gap: 15,
        }}
      >
        <Text bold>Created Collectibles</Text>

        <View style={{ width: "100%" }}>
          <View
            id="total"
            style={{ flexDirection: "row", gap: 5, alignItems: "center" }}
          >
            <Text>Total:</Text>
            <Text>5</Text>
          </View>

          <View
            id="used"
            style={{ flexDirection: "row", gap: 5, alignItems: "center" }}
          >
            <Text>Used:</Text>
            <Text>3</Text>
          </View>

          <View
            id="remaining"
            style={{ flexDirection: "row", gap: 5, alignItems: "center" }}
          >
            <Text>Remaining:</Text>
            <Text>2</Text>
          </View>
        </View>

        <View id="usage-bar" style={{ width: "100%", gap: 10 }}>
          <Text bold>Usage: {(3 / 5) * 100}%</Text>
          <Progress.Bar progress={3 / 5} width={null} color="white" />
        </View>
      </View>

      <View
        id="info-panel"
        style={{
          width: "100%",
          backgroundColor: "rgba(255,255,0,0.3)",
          padding: 10,
          borderRadius: 10,
          gap: 5,
        }}
      >
        <Text bold>Important Notice</Text>
        <Text fontSize={12}>
          Please note that your plan usage will not reset at the end of the
          current period. If you've reached your limits, you'll need to upgrade
          to a higher plan to continue enjoying our services without
          interruptions.
        </Text>
      </View>
    </View>
  );
};

export default currentPlan;
