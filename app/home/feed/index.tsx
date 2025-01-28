import { useAtom } from "jotai";
import React, { useEffect, useRef } from "react";
import { Platform, Pressable } from "react-native";

import CustomBottomModalSheet from "@/components/BottomSheet/CustomBottomModalSheet";
import CodeEnteringBottomSheetContent from "@/components/Collectible/CodeEnteringBottomSheetContent";
import { AntDesign } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";

import { collectCollectibleAtom } from "@/atoms/collectCollectibleAtom";

import AndroidFeed from "@/components/Feed/AndroidFeed";
import IOSFeed from "@/components/Feed/IOSFeed";

const index = () => {
  const codeEnteringBottomSheetModalRef = useRef<BottomSheetModal>(null);

  const [collectCollectibleAtomValue, setCollectCollectibleAtom] = useAtom(
    collectCollectibleAtom
  );

  const isIOS = Platform.OS === "ios";
  const isAndroid = Platform.OS === "android";

  /**
   * Manage collecting collectible with linking
   */
  useEffect(() => {
    if (!collectCollectibleAtomValue) return;

    const code = collectCollectibleAtomValue.code;
    if (!code) return setCollectCollectibleAtom(undefined);

    codeEnteringBottomSheetModalRef.current?.present();
  }, [collectCollectibleAtomValue]);

  const handlePressCodeEnterButton = () => {
    codeEnteringBottomSheetModalRef.current?.present();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable
              onPress={handlePressCodeEnterButton}
              style={{
                justifyContent: "center",
                alignItems: "flex-start",
                width: 45,
              }}
            >
              <AntDesign name="qrcode" size={24} color="white" />
            </Pressable>
          ),
        }}
      />

      {isIOS && <IOSFeed />}
      {isAndroid && <AndroidFeed />}

      <CustomBottomModalSheet
        ref={codeEnteringBottomSheetModalRef}
        backgroundColor="#1B1B1B"
      >
        <CodeEnteringBottomSheetContent
          bottomSheetModalRef={codeEnteringBottomSheetModalRef}
          collectibleCodeParamter={collectCollectibleAtomValue?.code || ""}
        />
      </CustomBottomModalSheet>
    </>
  );
};

export default index;
