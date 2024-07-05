import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { PropsWithChildren, forwardRef, useCallback } from "react";
import { View } from "react-native";

const CustomBottomModalSheet = forwardRef<BottomSheetModal, PropsWithChildren>(
  ({ children }, ref) => {
    const snapPoints = ["25%", "50%"];

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
        snapPoints={snapPoints}
        index={0}
        backdropComponent={renderBackdrops}
        backgroundStyle={{ backgroundColor: "#141414" }}
        handleIndicatorStyle={{ backgroundColor: "white" }}
      >
        <View style={{ flex: 1, padding: 10 }}>{children}</View>
      </BottomSheetModal>
    );
  }
);

export default CustomBottomModalSheet;
