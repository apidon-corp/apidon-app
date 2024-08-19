import { View, Pressable } from "react-native";
import React from "react";
import { BottomSheetModalData } from "@/types/Plans";
import { Ionicons } from "@expo/vector-icons";
import Text from "../Text/Text";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";

type Props = {
  title: string;
  isChecked: boolean;
  bottomSheetModalRef: React.RefObject<BottomSheetModalMethods>;
  bottomSheetModalData: BottomSheetModalData;
  setBottomSheetData: React.Dispatch<
    React.SetStateAction<BottomSheetModalData>
  >;
};

const FeatureObject = (props: Props) => {
  const handlePressInformationBubble = () => {
    props.setBottomSheetData(props.bottomSheetModalData);
    if (props.bottomSheetModalRef.current)
      props.bottomSheetModalRef.current.present();
  };

  return (
    <View
      id="undo-collectible"
      style={{
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
      }}
    >
      <Pressable
        onPress={handlePressInformationBubble}
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 5,
        }}
      >
        <Text fontSize={13}>{props.title}</Text>
        <Ionicons name="information-circle" size={18} color="gray" />
      </Pressable>

      {props.isChecked ? (
        <Ionicons name="checkmark-circle" size={24} color="green" />
      ) : (
        <Ionicons name="close-circle" size={24} color="red" />
      )}
    </View>
  );
};

export default FeatureObject;
