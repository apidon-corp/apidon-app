import { BottomSheetModal, BottomSheetTextInput } from "@gorhom/bottom-sheet";
import React, { useEffect, useState } from "react";
import { Keyboard, View } from "react-native";
import { Text } from "../../components/Text/Text";

import { collectCollectibleAtom } from "@/atoms/collectCollectibleAtom";
import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import { apidonPink } from "@/constants/Colors";
import apiRoutes from "@/helpers/ApiRoutes";
import appCheck from "@react-native-firebase/app-check";
import auth from "@react-native-firebase/auth";
import { useSetAtom } from "jotai";
import { ThemedButton } from "react-native-really-awesome-button";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";

type Props = {
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
  collectibleCodeParamter: string;
};

const CodeEnteringBottomSheetContent = ({
  bottomSheetModalRef,
  collectibleCodeParamter,
}: Props) => {
  const [code, setCode] = useState("");

  const [error, setError] = useState("");

  const setScreenParameters = useSetAtom(screenParametersAtom);

  const animatedErrorHeightValue = useSharedValue(0);

  const setCollectibleCodeAtom = useSetAtom(collectCollectibleAtom);

  const [buttonWidth, setButtonWidth] = useState(0);

  const handleCodeChange = (text: string) => {
    setError("");
    setCode(text);
  };

  const handlePressCollect = async () => {
    if (!code) return;

    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return;

    if (error) return;

    setError("");

    Keyboard.dismiss();

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

        return setError(message.slice(7));
      }

      bottomSheetModalRef.current?.dismiss();

      const { collectedDocPath } = await response.json();

      return setScreenParameters([
        { queryId: "collectedDocPath", value: collectedDocPath },
      ]);
    } catch (error) {
      return console.error(
        "Error on collecting event based collectible: ",
        error
      );
    }
  };

  useEffect(() => {
    animatedErrorHeightValue.value = withTiming(error ? 25 : 0);
  }, [error]);

  useEffect(() => {
    if (collectibleCodeParamter) {
      setCode(collectibleCodeParamter);
      setCollectibleCodeAtom(undefined);
    }
  }, [collectibleCodeParamter]);

  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        padding: 15,
        gap: 10,
      }}
    >
      <Text fontSize={24} bold>
        Enter Your Code
      </Text>
      <Text fontSize={12} style={{ textAlign: "center" }}>
        Please enter the code provided by the event organizer to collect the
        event based collectible.
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
          marginTop: 5,
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
          fontSize={11}
        >
          {error}
        </Text>
      </Animated.View>

      <View
        id="button-root"
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          setButtonWidth(width);
        }}
        style={{
          width: "40%",
          alignItems: "center",
          justifyContent: "center",
          opacity: code && error.length === 0 ? 1 : 0.5,
          borderRadius: 20,
        }}
      >
        <ThemedButton
          disabled={!code || error.length > 0}
          borderColor="transparent"
          progress
          onPress={async (next) => {
            await handlePressCollect();
            if (next) next();
          }}
          backgroundProgress="rgb(50, 50, 50)"
          name="rick"
          width={buttonWidth}
          height={buttonWidth * 0.3}
          paddingBottom={0}
          paddingHorizontal={0}
          paddingTop={0}
          backgroundColor={apidonPink}
          backgroundDarker="rgba(213, 63, 140, 0.5)"
        >
          <Text bold>Collect</Text>
        </ThemedButton>
        {/* <Pressable
          onPress={handlePressCollect}
          style={{
            width: "100%",
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
        </Pressable> */}
      </View>
    </View>
  );
};

export default CodeEnteringBottomSheetContent;
