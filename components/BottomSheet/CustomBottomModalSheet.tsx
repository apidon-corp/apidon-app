import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React, { PropsWithChildren, forwardRef, useCallback } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  backgroundColor?: string;
  locked?: boolean;
};

const CustomBottomModalSheet = forwardRef<
  BottomSheetModal,
  PropsWithChildren<Props>
>(({ children, backgroundColor, locked }, ref) => {
  const renderBackdrops = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior={locked ? "none" : undefined}
      />
    ),
    []
  );

  const { bottom } = useSafeAreaInsets();

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      backdropComponent={renderBackdrops}
      backgroundStyle={{ backgroundColor: backgroundColor || "#353935" }}
      handleIndicatorStyle={{ backgroundColor: "white" }}
      enableDynamicSizing={true}
      enableContentPanningGesture={locked ? false: undefined}
      enableHandlePanningGesture={locked ? false: undefined}
      enablePanDownToClose={locked ? false: undefined}
    >
      <BottomSheetScrollView contentContainerStyle={{ padding: 10 }}>
        {children}
        <View style={{ height: bottom }} />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

export default CustomBottomModalSheet;
