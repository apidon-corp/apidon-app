import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import { Text } from "@/components/Text/Text";
import { PostServerData } from "@/types/Post";
import { useAtomValue } from "jotai";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Keyboard,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import { apidonPink } from "@/constants/Colors";
import firestore from "@react-native-firebase/firestore";
import { Image } from "expo-image";
import { TextInput } from "react-native-gesture-handler";

import apiRoutes from "@/helpers/ApiRoutes";
import appCheck from "@react-native-firebase/app-check";
import auth from "@react-native-firebase/auth";
import { router } from "expo-router";

const listNFT = () => {
  const screenParameters = useAtomValue(screenParametersAtom);

  const postDocPath = screenParameters.find(
    (q) => q.queryId === "postDocPath"
  )?.value;

  const [postData, setPostData] = useState<PostServerData | null>(null);

  const [priceInput, setPriceInput] = useState("");
  const [price, setPrice] = useState(0);

  const [stockInput, setStockInput] = useState("");
  const [stock, setStock] = useState(0);

  const screenHeight = Dimensions.get("window").height;
  const animatedTranslateValue = useRef(new Animated.Value(0)).current;
  const containerRef = useRef<null | View>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getInitialData();
  }, [postDocPath]);

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

  const getInitialData = async () => {
    if (!postDocPath) return;

    const postDataFetched = await getPostData(postDocPath);
    if (!postDataFetched) return setPostData(null);

    if (postDataFetched.collectibleStatus.isCollectible) {
      console.error("Post is already a collectible.");
      return setPostData(null);
    }

    setPostData(postDataFetched);
  };

  const getPostData = async (postDocPath: string) => {
    try {
      const postDataSnapshot = await firestore().doc(postDocPath).get();
      if (!postDataSnapshot.exists) {
        console.error("Post's realtime data can not be fecthed.");
        return false;
      }

      const postDataFetched = postDataSnapshot.data() as PostServerData;

      return postDataFetched;
    } catch (error) {
      console.error("Error on getting inital data of post ", error);
      return false;
    }
  };

  const handlePriceChange = (input: string) => {
    if (input.includes(",")) {
      input = input.replace(",", ".");
    }

    if (input.includes(".")) {
      const dotIndex = input.indexOf(".");

      const maxLength = dotIndex + 1 + 2;

      input = input.slice(0, maxLength);
    }

    let dotCount = 0;
    for (const char of input) {
      if (char === ".") dotCount++;
    }

    if (dotCount > 1) {
      input = input.replace(".", "");
    }

    setPriceInput(input);

    if (input.length > 0 && input !== ".") {
      const floatPrice = parseFloat(input);
      if (isNaN(floatPrice)) {
        return setPrice(0);
      }
      setPrice(floatPrice);
    } else {
      setPrice(0);
    }
  };

  const handleStockChange = (input: string) => {
    setStockInput(input);

    if (input.length === 0) return setStock(0);

    const numberVersion = parseInt(input);

    if (isNaN(numberVersion)) return setStock(0);

    setStock(numberVersion);
  };

  const handleListButton = () => {
    if (!stock || !price) return;

    Alert.alert(
      "Create Collectible",
      `\nOnce listed, this collectible post cannot be deleted.\n\nAre you sure you want to create collectible for ${price} USD with a stock of ${stock}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Create",
          onPress: handleCreate,
        },
      ]
    );
  };

  const handleCreate = async () => {
    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return console.error("No user");

    if (loading) return;

    setLoading(true);

    try {
      const idToken = await currentUserAuthObject.getIdToken();
      const { token: appchecktoken } = await appCheck().getLimitedUseToken();

      const response = await fetch(apiRoutes.collectible.createCollectible, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
          appchecktoken,
        },
        body: JSON.stringify({
          postDocPath: postDocPath,
          price: price,
          stock: stock,
        }),
      });

      if (!response.ok) {
        console.error(
          "Response from createCollectible api is not okay: \n",
          await response.text()
        );
        return setLoading(false);
      }

      router.dismiss();

      return setLoading(false);
    } catch (error) {
      console.error("Error on creating collectible: ", error);
      return setLoading(false);
    }
  };

  if (!postDocPath) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Post doc path not found</Text>
      </View>
    );
  }

  if (!postData) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="white" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps={"handled"}>
      <Animated.View
        ref={containerRef}
        style={{
          padding: 10,
          gap: 20,
          transform: [
            {
              translateY: animatedTranslateValue,
            },
          ],
        }}
      >
        <View style={{ width: "100%" }}>
          <Image
            source={postData.image}
            style={{ width: "85%", aspectRatio: 1 }}
          />
        </View>
        <View
          id="price"
          style={{
            gap: 10,
          }}
        >
          <Text
            style={{
              fontSize: 20,
            }}
            bold
          >
            Price
          </Text>
          <TextInput
            value={priceInput}
            onChangeText={handlePriceChange}
            placeholder="₺53"
            placeholderTextColor="#808080"
            style={{
              color: "white",
              padding: 10,
              borderWidth: 1,
              borderColor: priceInput ? "#808080" : "red",
              borderRadius: 10,
            }}
            keyboardType="decimal-pad"
          />
          <View id="price-detail" style={{ gap: 5 }}>
            <View
              style={{ flexDirection: "row", gap: 4, alignItems: "center" }}
            >
              <Text>Apple Fee:</Text>
              <Text bold>${(price * 0.33).toFixed(2)}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 4 }}>
              <Text>Apidon Fee:</Text>
              <Text bold>${(price * 0.1).toFixed(2)}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 4 }}>
              <Text>Your Revenue:</Text>
              <Text bold>${(price * 0.57).toFixed(2)}</Text>
            </View>
          </View>
        </View>
        <View id="stock" style={{ gap: 5 }}>
          <Text
            style={{
              fontSize: 20,
            }}
            bold
          >
            Stock
          </Text>
          <TextInput
            value={stockInput === "" ? "" : stock.toString()}
            onChangeText={handleStockChange}
            placeholder="10"
            placeholderTextColor="#808080"
            style={{
              color: "white",
              padding: 10,
              borderWidth: 1,
              borderColor: stock ? "#808080" : "red",
              borderRadius: 10,
            }}
            keyboardType="number-pad"
          />
        </View>
        <View id="create">
          <Pressable
            disabled={loading}
            onPress={handleListButton}
            style={{
              backgroundColor: apidonPink,
              padding: 10,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                bold
                style={{
                  color: "white",
                  fontSize: 18,
                }}
              >
                Create
              </Text>
            )}
          </Pressable>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

export default listNFT;
