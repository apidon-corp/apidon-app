import { Text } from "@/components/Text/Text";
import { apidonPink } from "@/constants/Colors";
import { auth } from "@/firebase/client";
import apiRoutes from "@/helpers/ApiRoutes";
import { FollowStatusAPIResponseBody } from "@/types/ApiResponses";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Keyboard,
  Pressable,
  TextInput,
  View,
} from "react-native";

type Props = {
  username: string;
};

const CreateFrenlet = ({ username }: Props) => {
  const [message, setMessage] = useState("");

  const [isFren, setIsFren] = useState(false);
  const [checkFrenLoading, setCheckFrenLoading] = useState(false);

  const animatedHeightValue = useRef(new Animated.Value(0)).current;
  const animatedOpacityValue = useRef(new Animated.Value(0)).current;

  const [sendFrenletLoading, setSendFrenletLoading] = useState(false);

  const containerRef = useRef<null | View>(null);
  const screenHeight = Dimensions.get("window").height;
  const animatedTranslateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (username) checkFren();
  }, [username]);

  useEffect(() => {
    Animated.timing(animatedHeightValue, {
      toValue: isFren ? 160 : 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
    Animated.timing(animatedOpacityValue, {
      toValue: isFren ? 1 : 0,
      duration: 500,
      useNativeDriver: false,
      delay: 500,
    }).start();
  }, [isFren]);

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
              toValue += 40;
            }

            Animated.timing(animatedTranslateValue, {
              toValue: -toValue,
              duration: 250,
              useNativeDriver: false,
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
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [containerRef]);

  const handleMessageChange = (input: string) => {
    setMessage(input);
  };

  const checkFren = async () => {
    if (checkFrenLoading) return;

    const currentUserAuthObject = auth.currentUser;
    if (!currentUserAuthObject) return setIsFren(false);

    const userPanelBaseUrl = process.env.EXPO_PUBLIC_USER_PANEL_ROOT_URL;
    if (!userPanelBaseUrl) {
      console.error("User panel base url couldnt fetch from .env file");
      return setIsFren(false);
    }

    const route = `${userPanelBaseUrl}/api/social/followStatus`;

    setCheckFrenLoading(true);

    try {
      const idToken = await currentUserAuthObject.getIdToken();
      const response = await fetch(route, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          suspectUsername: username,
        }),
      });

      if (!response.ok) {
        setCheckFrenLoading(false);
        console.error(
          "Response from checkFren API is not okay: ",
          await response.text()
        );
        return setIsFren(false);
      }

      const result = (await response.json()) as FollowStatusAPIResponseBody;

      setCheckFrenLoading(false);

      return setIsFren(
        result.doesRequesterFollowsSuspect && result.doesSuspectFollowsRequester
      );
    } catch (error) {
      setCheckFrenLoading(false);
      console.error("Error on fetching to checkFren API: ", error);
      return setIsFren(false);
    }
  };

  const handleSendFrenlet = async () => {
    if (sendFrenletLoading) return;

    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) return;

    const currentUserAuthObject = auth.currentUser;
    if (!currentUserAuthObject) return;

    setSendFrenletLoading(true);
    setMessage(trimmedMessage);
    Keyboard.dismiss();

    try {
      const idToken = await currentUserAuthObject.getIdToken();

      // Send frenlet
      const response = await fetch(apiRoutes.frenlet.createFrenlet, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          fren: username,
          message: trimmedMessage,
          tag: "general",
        }),
      });

      if (!response.ok) {
        console.error(
          "Response from createFrenlet API is not okay: ",
          await response.text()
        );
        return setSendFrenletLoading(false);
      }

      // const result = (await response.json()) as CreateFrenletAPIResponseBody;

      setSendFrenletLoading(false);
      return setMessage("");

      // Good to go...
    } catch (error) {
      console.error("Error on fetching to createFrenlet API: ", error);
      return setSendFrenletLoading(false);
    }
  };

  return (
    <Animated.View
      ref={containerRef}
      style={{
        zIndex: 1,
        height: animatedHeightValue,
        position: "relative",
        width: "100%",
        marginVertical: 10,
        backgroundColor: "rgba(52,52,52,1)",
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        transform: [{ translateY: animatedTranslateValue }],
      }}
    >
      {isFren && (
        <>
          <Animated.View
            style={{
              opacity: animatedOpacityValue,
            }}
          >
            <Text bold>Create Frenlet</Text>
          </Animated.View>
          <Animated.View
            style={{
              opacity: animatedOpacityValue,
              position: "relative",
              borderWidth: 1,
              borderColor: "gray",
              borderRadius: 10,
              width: "95%",
              height: 100,
            }}
          >
            <View style={{ position: "absolute", bottom: 34, width: "100%" }}>
              <TextInput
                multiline
                numberOfLines={4}
                placeholder="Type something to your fren..."
                placeholderTextColor="gray"
                style={{
                  padding: 10,
                  color: "white",
                  height: 66,
                }}
                value={message}
                onChangeText={handleMessageChange}
              />
            </View>

            <Pressable
              style={{ position: "absolute", bottom: 10, right: 10 }}
              onPress={handleSendFrenlet}
              disabled={sendFrenletLoading}
            >
              {sendFrenletLoading ? (
                <ActivityIndicator color={apidonPink} />
              ) : (
                <Ionicons name="send" size={24} color={apidonPink} />
              )}
            </Pressable>
          </Animated.View>
        </>
      )}
    </Animated.View>
  );
};

export default CreateFrenlet;
