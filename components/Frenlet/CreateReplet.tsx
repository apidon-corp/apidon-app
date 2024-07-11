import { apidonPink } from "@/constants/Colors";
import { firestore } from "@/firebase/client";
import apiRoutes from "@/helpers/ApiRoutes";
import { UserInServer } from "@/types/User";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { doc, getDoc } from "firebase/firestore";
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

import auth from "@react-native-firebase/auth";

type Props = {
  frenletDocPath: string;
};

const CreateReplet = ({ frenletDocPath }: Props) => {
  const [currentUserLoading, setCurrentUserLoading] = useState(false);

  const [currentUserData, setCurrentUserData] = useState<null | UserInServer>(
    null
  );

  const [message, setMessage] = useState("");
  const [messageSendLoading, setMessageSendLoading] = useState(false);

  const screenHeight = Dimensions.get("window").height;
  const animatedTranslateValue = useRef(new Animated.Value(0)).current;
  const containerRef = useRef<null | View>(null);

  const handleGetCurrentUserData = async () => {
    if (currentUserLoading) return;
    setCurrentUserLoading(true);

    const displayName = auth().currentUser?.displayName;
    if (!displayName) {
      setCurrentUserLoading(false);
      return console.error("Auth object doesn't have auth object");
    }

    try {
      const userDocRef = doc(firestore, `users/${displayName}`);

      const userDocSnapshot = await getDoc(userDocRef);

      if (!userDocSnapshot.exists()) {
        setCurrentUserLoading(false);
        return console.error("User doesn't exist in database.");
      }

      const data = userDocSnapshot.data() as UserInServer;

      setCurrentUserData(data);

      return setCurrentUserLoading(false);
    } catch (error) {
      setCurrentUserLoading(false);
      console.error("Error on getting user data: ", error);
    }
  };

  const handleMessageChange = (input: string) => {
    setMessage(input);
  };

  const handleSendMessage = async () => {
    if (messageSendLoading) return;

    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) return;

    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return console.error("User is not logged");

    setMessageSendLoading(true);

    try {
      const idToken = await currentUserAuthObject.getIdToken();
      const response = await fetch(apiRoutes.frenlet.sendReply, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          message: trimmedMessage,
          frenletDocPath: frenletDocPath,
        }),
      });

      if (!response.ok) {
        setMessageSendLoading(false);
        return console.error(
          "Response from sendReplyAPI is not okay: ",
          await response.text()
        );
      }

      // Good to go
      Keyboard.dismiss();
      setMessage("");
      return setMessageSendLoading(false);
    } catch (error) {
      setMessageSendLoading(false);
      console.error("Error on sending message: ", error);
    }
  };

  useEffect(() => {
    handleGetCurrentUserData();
  }, []);

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
              toValue += 20;
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
  }, [containerRef]);

  return (
    <Animated.View
      ref={containerRef}
      style={{
        backgroundColor: "black",
        flexDirection: "row",
        borderWidth: 1,
        borderColor: "#808080",
        width: "100%",
        borderRadius: 20,
        paddingVertical: 5,
        paddingLeft: 5,
        paddingRight: 10,
        gap: 5,
        transform: [
          {
            translateY: animatedTranslateValue,
          },
        ],
      }}
    >
      <Image
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
        }}
        source={
          currentUserData?.profilePhoto || require("@/assets/images/user.jpg")
        }
        transition={500}
      />

      <TextInput
        value={message}
        onChangeText={handleMessageChange}
        placeholder="Join conversation..."
        placeholderTextColor="#808080"
        style={{
          flex: 1,
          padding: 5,
          color: "white",
        }}
      />

      <Pressable
        style={{
          justifyContent: "center",
          height: 50,
        }}
        disabled={messageSendLoading}
        onPress={handleSendMessage}
      >
        {messageSendLoading ? (
          <ActivityIndicator color="white" style={{ width: 24, height: 24 }} />
        ) : (
          <Ionicons name="send" size={24} color={apidonPink} />
        )}
      </Pressable>
    </Animated.View>
  );
};

export default CreateReplet;
