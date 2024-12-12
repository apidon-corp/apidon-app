import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import { Text } from "@/components/Text/Text";
import { useAtomValue } from "jotai";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import CodeItem from "@/components/code/CodeItem";
import { CodeDocData } from "@/types/Collectible";
import auth from "@react-native-firebase/auth";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import firestore from "@react-native-firebase/firestore";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import CustomBottomModalSheet from "@/components/BottomSheet/CustomBottomModalSheet";

import QRCode from "react-native-qrcode-svg";

const codes = () => {
  const screenParameters = useAtomValue(screenParametersAtom);
  const postDocPath = screenParameters.find((q) => q.queryId === "postDocPath")
    ?.value as string | undefined;

  const [codes, setCodes] = useState<CodeDocData[] | null>(null);

  const { bottom } = useSafeAreaInsets();

  const qrCodeBottomSheetModalRef = useRef<BottomSheetModal>(null);

  const [codeToShowQrCode, setCodeToShowQrCode] = useState("");

  const handleQRCodeButton = (code: string) => {
    setCodeToShowQrCode(code);
    qrCodeBottomSheetModalRef.current?.present();
  };

  const handleGetAvailableQRCodeButton = () => {
    if (!codes) return;

    const unusedCodes = codes.filter((q) => !q.isConsumed);

    if (unusedCodes.length === 0)
      return Alert.alert(
        "No Available QR Code",
        "There is no available QR code to show. All QR codes are used.",
        [
          {
            text: "OK",
            onPress: () => {},
          },
        ],
        { cancelable: false }
      );

    let randomValue = Math.floor(Math.random() * unusedCodes.length);

    const unusedCode = unusedCodes[randomValue];
    if (!unusedCode) return;

    if (unusedCodes.length !== 1 && unusedCode.code === codeToShowQrCode) {
      handleGetAvailableQRCodeButton();
      return;
    }

    setCodeToShowQrCode(unusedCode.code);
    qrCodeBottomSheetModalRef.current?.present();
  };

  useEffect(() => {
    if (!postDocPath) return setCodes(null);

    const displayName = auth().currentUser?.displayName;
    if (!displayName) return setCodes(null);

    const unsubscribe = firestore()
      .collection("collectibleCodes")
      .where("creatorUsername", "==", displayName)
      .where("postDocPath", "==", postDocPath)
      .onSnapshot(
        (snapshot) => {
          const codes = snapshot.docs.map((doc) => doc.data() as CodeDocData);
          setCodes(codes);
        },
        (error) => {
          console.error("Error on codes snapshot: ", error);
          setCodes(null);
        }
      );
    return () => unsubscribe();
  }, [postDocPath]);

  if (!postDocPath) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Post doc path not found</Text>
      </View>
    );
  }

  if (!codes) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (codes.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>No codes found</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: (bottom | 20) + 60,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={handleGetAvailableQRCodeButton}
          style={{
            width: "50%",
            borderRadius: 10,
            padding: 10,
            margin: 10,
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "center",
            backgroundColor: "white",
          }}
        >
          <Text
            bold
            fontSize={13}
            style={{
              color: "black",
            }}
          >
            Get Available QR Code
          </Text>
        </Pressable>

        <FlatList
          scrollEnabled={false}
          contentContainerStyle={{
            gap: 5,
            paddingHorizontal: 10,
          }}
          data={codes.sort((a, b) => Number(b) - Number(a))}
          renderItem={({ item }) => (
            <CodeItem
              code={item.code}
              isUsed={item.isConsumed}
              handleQRCodeButton={handleQRCodeButton}
            />
          )}
          keyExtractor={(item) => item.code}
        />
      </ScrollView>

      <BottomSheetModalProvider>
        <CustomBottomModalSheet
          ref={qrCodeBottomSheetModalRef}
          backgroundColor="#1B1B1B"
        >
          <View
            style={{
              flex: 1,
              gap: 20,
              padding: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
              }}
            >
              <Text fontSize={18} bold>
                Scan QR Code
              </Text>
              <Text fontSize={13}>
                Scan this QR code to redeem your collectible item.
              </Text>
            </View>

            <QRCode
              value={`${process.env.EXPO_PUBLIC_APP_LINK_BASE_URL}/cc/${codeToShowQrCode}`}
              size={250}
              backgroundColor="white"
              color="black"
              logo={require("@/assets/images/logo.png")}
            />
            <Text fontSize={14}>{codeToShowQrCode}</Text>

            {codes.find((q) => q.code === codeToShowQrCode)?.isConsumed && (
              <Text fontSize={13} bold style={{ color: "red" }}>
                This code has already been used.
              </Text>
            )}

            <Pressable
              onPress={handleGetAvailableQRCodeButton}
              style={{
                borderRadius: 10,
                padding: 10,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "white",
                margin: 5,
              }}
            >
              <Text
                fontSize={13}
                style={{
                  color: "black",
                }}
              >
                Get Another QR Code
              </Text>
            </Pressable>
          </View>
        </CustomBottomModalSheet>
      </BottomSheetModalProvider>
    </>
  );
};

export default codes;
