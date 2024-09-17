import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import { Text } from "@/components/Text/Text";
import { PostServerData } from "@/types/Post";
import { useAtomValue } from "jotai";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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

import CustomBottomModalSheet from "@/components/BottomSheet/CustomBottomModalSheet";
import { useInAppPurchases } from "@/hooks/useInAppPurchases";
import { AntDesign } from "@expo/vector-icons";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";

const STOCK_LIMIT = 100;

const listNFT = () => {
  // Trigger In-App-Purchase Store Notifications
  const { products } = useInAppPurchases();

  const prices = products.map((product) => {
    // Format of top up product item is like: "1_dollar_in_app_credit"
    // We need to get first element of this string

    const price = product.identifier.split("_")[0];

    const priceInt = parseInt(price);

    if (!isNaN(priceInt)) {
      return priceInt;
    } else {
      console.error(`Invalid price format: ${product.identifier}`);
      return 0;
    }
  });

  const screenParameters = useAtomValue(screenParametersAtom);

  const postDocPath = screenParameters.find(
    (q) => q.queryId === "postDocPath"
  )?.value;

  const [postData, setPostData] = useState<PostServerData | null>(null);

  const [price, setPrice] = useState(1);

  const [stockInput, setStockInput] = useState("");
  const [stock, setStock] = useState(0);

  const screenHeight = Dimensions.get("window").height;
  const animatedTranslateValue = useRef(new Animated.Value(0)).current;
  const containerRef = useRef<null | View>(null);

  const [loading, setLoading] = useState(false);

  const createButtonOpacityValue = useRef(new Animated.Value(0.5)).current;

  const informationModalRef = useRef<BottomSheetModal>(null);

  const [bottomModalType, setBottomModalType] = useState<
    "stock" | "price" | "createWarning"
  >("stock");

  // Getting inital post data.
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

  // Changing opactiy of create button.
  useEffect(() => {
    handleChangeOpactiy(
      createButtonOpacityValue,
      price && stock && !loading ? 1 : 0.5,
      250
    );
  }, [price, stock, loading]);

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

  const handleIncreasePrice = () => {
    const currentPrice = price;

    const currentPriceIndex = prices.indexOf(currentPrice);

    if (currentPriceIndex === -1) {
      console.error("Current price not found in prices array");
      return setPrice(1);
    }

    const maxIndex = prices.length - 1;

    const nextIndex =
      currentPriceIndex === maxIndex ? 0 : currentPriceIndex + 1;

    const nextPrice = prices[nextIndex];

    setPrice(nextPrice);
  };

  const handleDecreasePrice = () => {
    const currentPrice = price;

    const currentPriceIndex = prices.indexOf(currentPrice);

    if (currentPriceIndex === -1) {
      console.error("Current price not found in prices array");
      return setPrice(1);
    }

    const maxIndex = prices.length - 1;

    const nextIndex =
      currentPriceIndex === 0 ? maxIndex : currentPriceIndex - 1;

    const nextPrice = prices[nextIndex];

    setPrice(nextPrice);
  };

  const handleStockChange = (input: string) => {
    if (input.length === 0) {
      setStockInput("");
      return setStock(0);
    }

    const numberVersion = parseInt(input);
    if (isNaN(numberVersion)) {
      return;
    }

    if (numberVersion > STOCK_LIMIT) {
      setStockInput(STOCK_LIMIT.toString());
      return setStock(STOCK_LIMIT);
    }

    const validInput = numberVersion.toString();

    setStockInput(validInput);
    setStock(numberVersion);
  };

  const handleCreateButton = () => {
    if (!stock || !price || loading) return;

    Keyboard.dismiss();

    setBottomModalType("createWarning");
    informationModalRef.current?.present();
  };

  const handleConfirmButton = async () => {
    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return console.error("No user");

    if (!price || !stock) return;

    if (stock > STOCK_LIMIT) return;

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

      informationModalRef.current?.dismiss();

      router.dismiss();

      return setLoading(false);
    } catch (error) {
      console.error("Error on creating collectible: ", error);
      return setLoading(false);
    }
  };

  const handleCancelButton = () => {
    informationModalRef.current?.dismiss();
  };

  const handlePressStockInformationButton = () => {
    if (informationModalRef.current) {
      Keyboard.dismiss();
      setBottomModalType("stock");
      informationModalRef.current.present();
    }
  };

  const handlePressPriceInformationButton = () => {
    if (informationModalRef.current) {
      Keyboard.dismiss();
      setBottomModalType("price");
      informationModalRef.current.present();
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
    <>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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
          <View
            id="image-area"
            style={{
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={postData.image}
              style={{ width: "65%", aspectRatio: 1, borderRadius: 20 }}
            />
          </View>

          <View
            id="price-area"
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: 20,
              padding: 15,
              gap: 5,
            }}
          >
            <View
              id="title-and-info-bubble"
              style={{
                width: "100%",
                justifyContent: "space-between",
                flexDirection: "row",
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
              <Pressable onPress={handlePressPriceInformationButton}>
                <AntDesign name="infocirlceo" size={18} color="white" />
              </Pressable>
            </View>

            <View
              style={{
                gap: 2,
                width: "100%",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View
                id="input-with-buttons"
                style={{
                  flexDirection: "row",
                  width: "45%",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View
                  id="input"
                  style={{
                    flexDirection: "row",
                    width: "70%",
                    overflow: "hidden",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    padding: 15,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    bold
                    style={{
                      fontSize: 20,
                      color: "white",
                    }}
                  >
                    $ {price}
                  </Text>
                </View>
                <View
                  id="buttons"
                  style={{
                    width: "20%",
                    gap: 10,
                  }}
                >
                  <Pressable onPress={handleIncreasePrice}>
                    <AntDesign name="pluscircleo" size={24} color="white" />
                  </Pressable>
                  <Pressable onPress={handleDecreasePrice}>
                    <AntDesign name="minuscircle" size={24} color="white" />
                  </Pressable>
                </View>
              </View>

              <View
                id="price-detail"
                style={{
                  width: "50%",
                  justifyContent: "center",
                  alignItems: "flex-end",
                  overflow: "hidden",
                }}
              >
                <View
                  id="apple-fee"
                  style={{
                    opacity: 0.5,
                    flexDirection: "row",
                    gap: 4,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text fontSize={13}>Apple Fee:</Text>
                  <Text bold>${(price * 0.3).toFixed(2)}</Text>
                </View>
                <View
                  id="apidon-fee"
                  style={{
                    opacity: 0.5,
                    flexDirection: "row",
                    gap: 4,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text fontSize={13}>Apidon Fee:</Text>
                  <Text bold>${(price * 0.1).toFixed(2)}</Text>
                </View>
                <View
                  id="revenue"
                  style={{
                    flexDirection: "row",
                    gap: 4,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text fontSize={13}>Your Revenue:</Text>
                  <Text bold>${(price * 0.6).toFixed(2)}</Text>
                </View>
              </View>
            </View>
          </View>

          <View
            id="stock"
            style={{
              width: "100%",
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: 20,
              padding: 15,
              gap: 5,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                gap: 5,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                }}
                bold
              >
                Stock
              </Text>
              <Pressable onPress={handlePressStockInformationButton}>
                <AntDesign name="infocirlceo" size={18} color="white" />
              </Pressable>
            </View>

            <TextInput
              value={stockInput === "" ? "" : stock.toString()}
              onChangeText={handleStockChange}
              placeholder={`Maximum ${STOCK_LIMIT}`}
              placeholderTextColor="#808080"
              style={{
                width: "100%",
                color: "white",
                backgroundColor: "rgba(255,255,255,0.05)",
                padding: 10,
                borderRadius: 10,
              }}
              keyboardType="number-pad"
            />
          </View>

          <Animated.View
            id="create"
            style={{
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              opacity: createButtonOpacityValue,
            }}
          >
            <Pressable
              disabled={loading || !price || !stock}
              onPress={handleCreateButton}
              style={{
                width: "25%",
                height: 35,
                backgroundColor: apidonPink,
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
                    fontSize: 16,
                  }}
                >
                  Create
                </Text>
              )}
            </Pressable>
          </Animated.View>
        </Animated.View>
      </ScrollView>

      <BottomSheetModalProvider>
        <CustomBottomModalSheet
          ref={informationModalRef}
          backgroundColor="#1B1B1B"
        >
          <View style={{ flex: 1, gap: 15, padding: 10 }}>
            {bottomModalType === "stock" && (
              <>
                <Text bold fontSize={18}>
                  Maximum Stock Limit
                </Text>
                <Text fontSize={13}>
                  You can set a maximum of {STOCK_LIMIT} stock for each
                  collectible.
                </Text>
              </>
            )}
            {bottomModalType === "price" && (
              <>
                <Text bold fontSize={18}>
                  Fixed Price Options
                </Text>
                <Text fontSize={13}>
                  Choose from our preset prices to ensure a seamless purchasing
                  experience through in-app purchases. This makes buying your
                  items easier and more straightforward for everyone.
                </Text>
              </>
            )}
            {bottomModalType === "createWarning" && (
              <>
                <Text fontSize={18} bold>
                  Confirm Creation
                </Text>
                <Text fontSize={13}>
                  You are about to create a collectible post priced at ${price}{" "}
                  with a stock of {stock}.
                </Text>
                <Text fontSize={13}>
                  Please note that once listed, this collectible cannot be
                  deleted by yourself, and you won't be able to change the stock
                  or price.
                </Text>
                <Text fontSize={13}>Review and confirm your purchase.</Text>
                <Pressable
                  onPress={handleConfirmButton}
                  style={{
                    backgroundColor: "white",
                    padding: 10,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {loading ? (
                    <ActivityIndicator color="black" size="small" />
                  ) : (
                    <Text style={{ color: "black" }}>Confirm</Text>
                  )}
                </Pressable>
                <Pressable
                  disabled={loading}
                  onPress={handleCancelButton}
                  style={{
                    borderWidth: 1,
                    borderColor: "white",
                    padding: 10,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text>Cancel</Text>
                </Pressable>
              </>
            )}
          </View>
        </CustomBottomModalSheet>
      </BottomSheetModalProvider>
    </>
  );
};

export default listNFT;
