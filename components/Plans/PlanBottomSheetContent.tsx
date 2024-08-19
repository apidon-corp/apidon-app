import { View } from "react-native";

import React from "react";
import Text from "../Text/Text";

type Props = {
  title: string;
  description: string;
};

const PlanBottomSheetContent = ({ title, description }: Props) => {
  return (
    <View style={{ flex: 1, gap: 15, padding: 10 }}>
      <>
        <Text bold fontSize={18}>
          {title}
        </Text>
        <Text fontSize={13}>{description}</Text>
      </>
    </View>
  );
};

export default PlanBottomSheetContent;
