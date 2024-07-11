import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import { Text } from "@/components/Text/Text";
import { apidonPink } from "@/constants/Colors";
import {  firestore } from "@/firebase/client";
import apiRoutes from "@/helpers/ApiRoutes";
import { PostServerData } from "@/types/Post";
import { Image } from "expo-image";
import { router } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { useAtomValue } from "jotai";
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

const createNFT = () => {
  const screenParameters = useAtomValue(screenParametersAtom);

  const postDocPath = screenParameters.find(
    (q) => q.queryId === "postDocPath"
  )?.value;

  const [postDocData, setPostDocData] = useState<PostServerData | null>(null);

  const titleInputRef = useRef<TextInput>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const screenHeight = Dimensions.get("window").height;
  const animatedTranslateValue = useRef(new Animated.Value(0)).current;
  const containerRef = useRef<null | View>(null);

  const [loading, setLoading] = useState(false);

  // Dynamic Data Fetching / Post Object
  useEffect(() => {
    if (!postDocPath) return;

    const postDocRef = doc(firestore, postDocPath);
    const unsubscribe = onSnapshot(
      postDocRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          return console.log("Post's realtime data can not be fecthed.");
        }
        const postDocData = snapshot.data() as PostServerData;
        setDescription(postDocData.description);
        return setPostDocData(postDocData);
      },
      (error) => {
        return console.error("Error on getting realtime data: ", error);
      }
    );

    return () => unsubscribe();
  }, [postDocPath]);

  // Keyboard-Layout Change
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      "keyboardWillShow",
      (event) => {
        if (titleInputRef.current && titleInputRef.current.isFocused()) return;

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
        if (titleInputRef.current && titleInputRef.current.isFocused()) return;

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

  const handleCreateNFTButton = async () => {
    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return console.error("No user");

    if (loading) return;

    setLoading(true);

    try {
      const idToken = await currentUserAuthObject.getIdToken();
      const response = await fetch(apiRoutes.nft.uploadNFT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          postDocPath: postDocPath,
          title: title,
          description: description,
        }),
      });

      if (!response.ok) {
        console.error(
          "Response from createNFT API is not okay: ",
          await response.text()
        );
        return setLoading(false);
      }

      setLoading(false);
      return router.dismiss();
    } catch (error) {
      console.error("Error on creating NFT: ", error);
      return setLoading(false);
    }
  };

  if (!postDocData) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={apidonPink} size="large" />
      </View>
    );
  }

  return (
    <Animated.View
      ref={containerRef}
      style={{
        padding: 15,
        gap: 15,
        transform: [
          {
            translateY: animatedTranslateValue,
          },
        ],
      }}
    >
      <View
        style={{
          gap: 5,
        }}
      >
        <Text
          bold
          style={{
            fontSize: 14,
          }}
        >
          Title
        </Text>
        <TextInput
          ref={titleInputRef}
          value={title}
          onChangeText={setTitle}
          style={{
            color: "white",
            padding: 10,
            borderWidth: 1,
            borderColor: "#808080",
            borderRadius: 10,
          }}
          placeholder="Perfect Sunshine..."
          placeholderTextColor="#808080"
        />
      </View>
      <View>
        <Image
          source={postDocData.image}
          style={{
            width: "100%",
            aspectRatio: 1,
            borderRadius: 10,
          }}
        />
      </View>
      <View
        style={{
          gap: 5,
        }}
      >
        <Text
          bold
          style={{
            fontSize: 14,
          }}
        >
          Description
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={{
            padding: 10,
            borderWidth: 1,
            borderColor: "#808080",
            borderRadius: 10,
            color: "white",
          }}
        />
      </View>

      <Pressable
        style={{
          marginVertical: 10,
          backgroundColor: apidonPink,
          padding: 10,
          borderRadius: 10,
          alignItems: "center",
        }}
        onPress={handleCreateNFTButton}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text
            bold
            style={{
              fontSize: 18,
            }}
          >
            Create NFT!
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
};

export default createNFT;
