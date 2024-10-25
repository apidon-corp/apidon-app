import { BottomSheetModal, BottomSheetTextInput } from "@gorhom/bottom-sheet";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Text } from "../../components/Text/Text";

import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import apiRoutes from "@/helpers/ApiRoutes";
import appCheck from "@react-native-firebase/app-check";
import auth from "@react-native-firebase/auth";
import { router } from "expo-router";
import { useSetAtom } from "jotai";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";

type Props = {
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
};

const CodeEnteringBottomSheetContent = ({ bottomSheetModalRef }: Props) => {
  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const setScreenParameters = useSetAtom(screenParametersAtom);

  const animatedErrorHeightValue = useSharedValue(0);

  const handleCodeChange = (text: string) => {
    setError("");
    setCode(text);
  };

  const handlePressCollect = async () => {
    if (!code || loading) return;

    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return;

    setLoading(true);

    try {
      const idToken = await currentUserAuthObject.getIdToken();
      const { token: appchecktoken } = await appCheck().getLimitedUseToken();

      const response = await fetch(
        apiRoutes.collectible.eventBased.collectCollectible,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${idToken}`,
            appchecktoken,
          },
          body: JSON.stringify({
            code: code,
          }),
        }
      );

      if (!response.ok) {
        const message = await response.text();

        console.error(
          "Response from collectCollectible api is not okay: \n",
          message
        );

        setError(message);

        return setLoading(false);
      }

      bottomSheetModalRef.current?.dismiss();

      setScreenParameters([
        { queryId: "collectedNFTPostDocPath", value: "garbage_value" },
      ]);
      router.push(
        `/home/feed/profilePage?username=${currentUserAuthObject.displayName}`
      );

      return setLoading(false);
    } catch (error) {
      console.error("Error on collecting event based collectible: ", error);
      return setLoading(false);
    }
  };

  useEffect(() => {
    animatedErrorHeightValue.value = withTiming(error ? 25 : 0);
  }, [error]);

  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        gap: 15,
        padding: 15,
      }}
    >
      <Text fontSize={24} bold>
        Enter Your Code
      </Text>
      <BottomSheetTextInput
        onChangeText={handleCodeChange}
        value={code}
        placeholder="XXXXX"
        style={{
          width: "80%",
          marginHorizontal: 12,
          padding: 12,
          borderRadius: 12,
          backgroundColor: "rgba(255,255,255,0.1)",
          color: "white",
          textAlign: "center",
          fontSize: 16,
        }}
      />
      <Animated.View
        style={{
          height: animatedErrorHeightValue,
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            textAlign: "center",
            color: "red",
          }}
        >
          {error}
        </Text>
      </Animated.View>

      <Pressable
        onPress={handlePressCollect}
        style={{
          width: "45%",
          backgroundColor: "white",
          padding: 10,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator color="black" />
        ) : (
          <Text
            fontSize={14}
            bold
            style={{
              color: "black",
            }}
          >
            Collect
          </Text>
        )}
      </Pressable>
    </View>
  );
};

export default CodeEnteringBottomSheetContent;
