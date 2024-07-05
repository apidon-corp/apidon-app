import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { PropsWithChildren, forwardRef, useCallback } from "react";
import { View } from "react-native";

type Props = {
  snapPoint: string;
};

const CustomBottomModalSheet = forwardRef<
  BottomSheetModal,
  PropsWithChildren<Props>
>(({ children, snapPoint }, ref) => {
  const renderBackdrops = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={[snapPoint]}
      index={0}
      backdropComponent={renderBackdrops}
      backgroundStyle={{ backgroundColor: "#353935" }}
      handleIndicatorStyle={{ backgroundColor: "white" }}
    >
      <View style={{ flex: 1, padding: 10 }}>{children}</View>
    </BottomSheetModal>
  );
});

export default CustomBottomModalSheet;
