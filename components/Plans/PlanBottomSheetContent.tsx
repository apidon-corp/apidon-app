import { View } from "react-native";

import React from "react";
import Text from "../Text/Text";

type Props = {
  detailId: "collect-sold-out" | "collectible-limit" | "stock-limit";
};

const PlanBottomSheetContent = ({ detailId }: Props) => {
  return (
    <View style={{ flex: 1, gap: 15, padding: 10 }}>
      {detailId === "collect-sold-out" && (
        <>
          <Text bold fontSize={18}>
            Collect Sold Out
          </Text>
          <Text fontSize={13}>
            This plan allows you to collect products that have already been
            sold.
          </Text>
        </>
      )}
      {detailId === "collectible-limit" && (
        <>
          <Text bold fontSize={18}>
            Collectible Limit
          </Text>
          <Text fontSize={13}>
            This plan allows you to collect a limited number of products.
          </Text>
        </>
      )}
      {detailId === "stock-limit" && (
        <>
          <Text bold fontSize={18}>
            Stock Limit
          </Text>
          <Text fontSize={13}>
            This plan allows you to limit the stock of your products.
          </Text>
        </>
      )}
    </View>
  );
};

export default PlanBottomSheetContent;
