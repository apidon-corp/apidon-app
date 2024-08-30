import Text from "@/components/Text/Text";
import { useBalance } from "@/hooks/useBalance";
import { WithdrawRequestInput } from "@/types/Withdraw";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Keyboard,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "@/providers/AuthProvider";
import { UserIdentityDoc } from "@/types/Identity";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { router, usePathname } from "expo-router";

import { isValidBIC } from "ibantools";

import appCheck from "@react-native-firebase/app-check";
import apiRoutes from "@/helpers/ApiRoutes";

const RequestWithdraw = () => {
  const { authStatus } = useAuth();

  const { balance } = useBalance();

  const pathname = usePathname();

  const [requestInputData, setRequestInputData] =
    useState<WithdrawRequestInput>({
      bankDetails: {
        accountNumber: "",
        bankName: "",
        swiftCode: "",
      },
    });

  const [identityDocData, setIdentityDocData] = useState<
    UserIdentityDoc | "not-created" | null
  >(null);

  const containerRef = useRef<null | View>(null);
  const screenHeight = Dimensions.get("window").height;
  const animatedTranslateValue = useRef(new Animated.Value(0)).current;

  const [hasValidSwift, setHasValidSwift] = useState(false);

  const requestButtonOpacityValue = useRef(new Animated.Value(0.5)).current;

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authStatus !== "authenticated") return;

    const currentUserDisplayname = auth().currentUser?.displayName || "";
    if (!currentUserDisplayname) return;

    const unsubscribe = firestore()
      .doc(`users/${currentUserDisplayname}/personal/identity`)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            const data = doc.data() as UserIdentityDoc;
            setIdentityDocData(data);
          } else {
            setIdentityDocData("not-created");
          }
        },
        (error) => {
          console.error("Error fetching identity data:", error);
          setIdentityDocData(null);
        }
      );

    () => unsubscribe();
  }, [authStatus]);

  // Keyboard-Layout Change
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      "keyboardWillShow",
      (event) => {
        if (Keyboard.isVisible()) return;

        const keyboardHeight = event.endCoordinates.height;

        if (containerRef.current) {
          containerRef.current.measure((x, y, width, height, pageX, pageY) => {
            const containerBottom = pageY + height;
            const distanceFromBottom = screenHeight - containerBottom;

            let toValue = 0;
            if (distanceFromBottom > keyboardHeight) {
              toValue = 0;
            } else {
              toValue = keyboardHeight - distanceFromBottom;
            }

            Animated.timing(animatedTranslateValue, {
              toValue: -toValue,
              duration: 250,
              useNativeDriver: true,
            }).start();
          });
        }
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      "keyboardWillHide",
      (event) => {
        let toValue = 0;

        Animated.timing(animatedTranslateValue, {
          toValue: toValue,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  useEffect(() => {
    const status =
      requestInputData.bankDetails.accountNumber &&
      requestInputData.bankDetails.bankName &&
      requestInputData.bankDetails.swiftCode &&
      hasValidSwift &&
      !loading;

    handleChangeOpactiy(requestButtonOpacityValue, status ? 1 : 0.5, 250);
  }, [hasValidSwift, requestInputData, loading]);

  const handlePressVerifyButton = () => {
    const subScreens = pathname.split("/");

    const length = subScreens.length;

    subScreens[length - 1] = "identity";

    const path = subScreens.join("/");

    router.push(path);
  };

  const handleSwiftChange = (input: string) => {
    input = input.toUpperCase();

    const isValidSwift = isValidBIC(input);

    setHasValidSwift(isValidSwift);

    setRequestInputData((prev) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        swiftCode: input,
      },
    }));
  };

  const handleChangeOpactiy = (
    animatedObject: Animated.Value,
    toValue: number,
    duration: number
  ) => {
    Animated.timing(animatedObject, {
      toValue,
      duration,
      useNativeDriver: true,
    }).start();
  };

  const handleCreateRequestButton = async () => {
    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return;

    if (!hasValidSwift) return;

    if (loading) return;

    setLoading(true);

    try {
      const idToken = await currentUserAuthObject.getIdToken();

      const { token: appchecktoken } = await appCheck().getLimitedUseToken();

      const response = await fetch(apiRoutes.withdraw.requestWithdraw, {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
          appchecktoken,
        },
        method: "POST",
        body: JSON.stringify({
          accountNumber: requestInputData.bankDetails.accountNumber,
          bankName: requestInputData.bankDetails.bankName,
          swiftCode: requestInputData.bankDetails.swiftCode,
          routingNumber: requestInputData.bankDetails.routingNumber,
        }),
      });

      if (!response.ok) {
        console.error(
          "Response from postUpload API is not okay: ",
          await response.text()
        );
        return setLoading(false);
      }

      if (router.canGoBack()) router.back();

      return setLoading(false);
    } catch (error) {
      console.error("Error on fetching to requestWithdraw API: ", error);
      return setLoading(false);
    }
  };

  if (
    balance === "error" ||
    balance === "getting-balance" ||
    !identityDocData
  ) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color="white" size="small" />
      </View>
    );
  }

  if (
    identityDocData === "not-created" ||
    identityDocData.status !== "verified"
  ) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Text style={{ textAlign: "center" }}>
          You need to verfiy yourself before request a withdraw.
        </Text>
        <Pressable
          onPress={handlePressVerifyButton}
          style={{
            backgroundColor: "white",
            padding: 10,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "black" }}>Verify</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Animated.View
      ref={containerRef}
      style={{
        flex: 1,
        transform: [
          {
            translateY: animatedTranslateValue,
          },
        ],
      }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 15,
          gap: 20,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View id="amount-area" style={{ width: "100%", gap: 10 }}>
          <Text bold fontSize={18}>
            Amount
          </Text>

          <View
            id="amount"
            style={{
              width: "100%",
              gap: 5,
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: 10,
              padding: 10,
            }}
          >
            <View
              id="current-balance"
              style={{
                width: "100%",
                flexDirection: "row",
                gap: 5,
                alignItems: "center",
              }}
            >
              <Text fontSize={16} bold>
                Current Balance:{" "}
              </Text>
              <Text fontSize={16} bold>
                ${balance}
              </Text>
            </View>

            <View
              id="fees"
              style={{
                width: "100%",
                gap: 5,
              }}
            >
              <View id="fees-title" style={{ gap: 5, flexDirection: "row" }}>
                <Text fontSize={16} bold>
                  Fees:
                </Text>
                <Text fontSize={16} bold>
                  ${balance * 0.4 + 20}
                </Text>
              </View>

              <View
                id="fee-details"
                style={{
                  width: "100%",
                  gap: 3,
                  justifyContent: "flex-end",
                  alignItems: "flex-end",
                }}
              >
                <View
                  id="apple-fee"
                  style={{
                    flexDirection: "row",
                    gap: 5,
                    alignItems: "center",
                  }}
                >
                  <Text bold fontSize={12} style={{ color: "gray" }}>
                    Apple Fee:
                  </Text>
                  <Text bold fontSize={12}>
                    ${balance * 0.3}
                  </Text>
                </View>

                <View
                  id="apidon-fee"
                  style={{
                    flexDirection: "row",
                    gap: 5,
                    alignItems: "center",
                  }}
                >
                  <Text bold fontSize={12} style={{ color: "gray" }}>
                    Apidon Fee:
                  </Text>
                  <Text bold fontSize={12}>
                    ${balance * 0.1}
                  </Text>
                </View>

                <View
                  id="wire-fee"
                  style={{
                    flexDirection: "row",
                    gap: 5,
                    alignItems: "center",
                  }}
                >
                  <Text bold fontSize={12} style={{ color: "gray" }}>
                    Wire Fee:
                  </Text>
                  <Text bold fontSize={12}>
                    $20
                  </Text>
                </View>
              </View>
            </View>

            <View
              id="net"
              style={{
                width: "100%",
                flexDirection: "row",
                gap: 5,
                alignItems: "center",
              }}
            >
              <Text fontSize={16} bold>
                Net Payout:
              </Text>
              <Text fontSize={16} bold>
                $ {balance * 0.6 - 20}
              </Text>
            </View>
          </View>
        </View>

        <View
          id="bank-details"
          style={{
            width: "100%",
            gap: 10,
          }}
        >
          <Text bold fontSize={18}>
            Bank Account Details
          </Text>

          <View id="account-holder-area" style={{ width: "100%", gap: 5 }}>
            <Text bold>Account Holder Name</Text>
            <View
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                padding: 10,
                borderRadius: 10,
              }}
            >
              <Text>
                {identityDocData.firstName} {identityDocData.lastName}
              </Text>
            </View>
          </View>

          <View id="bank-name" style={{ width: "100%", gap: 5 }}>
            <Text bold>Bank Name</Text>
            <TextInput
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                padding: 10,
                borderRadius: 10,
                color: "white",
              }}
              value={requestInputData.bankDetails.bankName || undefined}
              onChangeText={(text) =>
                setRequestInputData({
                  ...requestInputData,
                  bankDetails: {
                    ...requestInputData.bankDetails,
                    bankName: text,
                  },
                })
              }
              placeholder="Bank Name"
            />
          </View>

          <View id="account-iban-number-area" style={{ width: "100%", gap: 5 }}>
            <Text bold>Account or IBAN Number</Text>
            <TextInput
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                padding: 10,
                borderRadius: 10,
                color: "white",
              }}
              value={requestInputData.bankDetails.accountNumber || undefined}
              onChangeText={(text) =>
                setRequestInputData({
                  ...requestInputData,
                  bankDetails: {
                    ...requestInputData.bankDetails,
                    accountNumber: text,
                  },
                })
              }
              placeholder="Account or IBAN Number"
            />
          </View>

          <View
            id="swift-code-area"
            style={{
              width: "100%",
              gap: 5,
            }}
          >
            <View
              id="title"
              style={{ flexDirection: "row", gap: 5, alignItems: "center" }}
            >
              <Text bold>Swift Code</Text>
            </View>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: !requestInputData.bankDetails.swiftCode
                  ? undefined
                  : hasValidSwift
                  ? "green"
                  : "red",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                padding: 10,
                borderRadius: 10,
                color: "white",
              }}
              value={requestInputData.bankDetails.swiftCode || undefined}
              onChangeText={handleSwiftChange}
              placeholder="Swift Code"
            />
          </View>

          <View
            id="routing-number-area"
            style={{
              width: "100%",
              gap: 5,
            }}
          >
            <View
              id="title"
              style={{ flexDirection: "row", gap: 5, alignItems: "center" }}
            >
              <Text bold>Routing Number</Text>
              <Text fontSize={12}>(USA Only)</Text>
            </View>
            <TextInput
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                padding: 10,
                borderRadius: 10,
                color: "white",
              }}
              value={requestInputData.bankDetails.routingNumber || undefined}
              onChangeText={(text) =>
                setRequestInputData({
                  ...requestInputData,
                  bankDetails: {
                    ...requestInputData.bankDetails,
                    routingNumber: text,
                  },
                })
              }
              placeholder="Routing Number"
            />
          </View>
        </View>

        <Animated.View
          id="create-request-button-area"
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            opacity: requestButtonOpacityValue,
          }}
        >
          <Pressable
            disabled={loading}
            onPress={handleCreateRequestButton}
            style={{
              padding: 10,
              backgroundColor: "white",
              borderRadius: 10,
            }}
          >
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Text style={{ color: "black" }}>Create Request</Text>
            )}
          </Pressable>
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
};

export default RequestWithdraw;
