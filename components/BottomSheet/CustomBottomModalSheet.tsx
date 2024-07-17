import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React, { PropsWithChildren, forwardRef, useCallback } from "react";
import { View } from "react-native";

type Props = {
  snapPoint: string;
  backgroundColor?: string;
};

const CustomBottomModalSheet = forwardRef<
  BottomSheetModal,
  PropsWithChildren<Props>
>(({ children, snapPoint, backgroundColor }, ref) => {
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
      //snapPoints={[snapPoint]}
      index={0}
      backdropComponent={renderBackdrops}
      backgroundStyle={{ backgroundColor: backgroundColor || "#353935" }}
      handleIndicatorStyle={{ backgroundColor: "white" }}
      enableDynamicSizing={true}
    >
      <BottomSheetScrollView
        contentContainerStyle={{
          padding: 10,
        }}
      >
        {children}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

export default CustomBottomModalSheet;
