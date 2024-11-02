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
  Switch,
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
import { CollectibleConfigDocData } from "@/types/Config";
import { UserInServer } from "@/types/User";
import { AntDesign } from "@expo/vector-icons";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { CollectibleType } from "@/types/Collectible";
import { UserIdentityDoc } from "@/types/Identity";

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

  const postDocPath =
    screenParameters.find((q) => q.queryId === "postDocPath")?.value ||
    "users/yunuskorkmaz/posts/1729771765193";

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
    "stock" | "price" | "createTradeWarning" | "createEventWarning"
  >("stock");

  const [isVerified, setIsVerified] = useState(false);

  const [stockLimit, setStockLimit] = useState<null | number>(null);

  const [collectibleType, setCollectibleType] =
    useState<CollectibleType>("trade");

  const [identityDocData, setIdentityDocData] =
    useState<UserIdentityDoc | null>(null);

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
    let identityStatus = false;
    if (identityDocData) identityStatus = identityDocData.status === "verified";

    handleChangeOpactiy(
      createButtonOpacityValue,
      isVerified && identityStatus && price && stock && !loading ? 1 : 0.5,
      250
    );
  }, [price, stock, loading, isVerified, identityDocData]);

  // Dynamic Data Fetching - Current User Status (verified)
  useEffect(() => {
    const displayName = auth().currentUser?.displayName || "";
    if (!displayName) return setIsVerified(false);

    const unsubscribe = firestore()
      .doc(`users/${displayName}`)
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) {
            console.error("User data is not found.");
            return setIsVerified(false);
          }

          const data = snapshot.data() as UserInServer;

          if (!data) {
            console.error("User data is undefined.");
            return setIsVerified(false);
          }

          setIsVerified(data.verified);
        },
        (error) => {
          console.error("Error on getting realtime data  ", error);
          setIsVerified(false);
        }
      );

    return () => unsubscribe();
  }, []);

  // Dynamic Data Fetching - Stock Limit
  useEffect(() => {
    const unsubscribe = firestore()
      .doc(`config/collectible`)
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) {
            console.error("Stock limit data is not found.");
            return setStockLimit(null);
          }

          const data = snapshot.data() as CollectibleConfigDocData;

          if (!data) {
            console.error("Stock limit data is undefined.");
            return setStockLimit(null);
          }

          setStockLimit(data.stockLimit);
        },
        (error) => {
          console.error("Error on getting realtime data  ", error);
          setStockLimit(null);
        }
      );

    return () => unsubscribe();
  }, []);

  // Get realtime identity verification status of user.
  useEffect(() => {
    const displayName = auth().currentUser?.displayName;
    if (!displayName) return;

    const unsubscribe = firestore()
      .doc(`users/${displayName}/personal/identity`)
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) {
            console.error("Identity doc can not be fetched.");
            return setIdentityDocData(null);
          }
          setIdentityDocData(snapshot.data() as UserIdentityDoc);
        },
        (error) => {
          console.error("Error on getting identity doc ", error);
          setIdentityDocData(null);
        }
      );

    return () => unsubscribe();
  }, []);

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
    if (stockLimit === null) return;

    if (input.length === 0) {
      setStockInput("");
      return setStock(0);
    }

    const numberVersion = parseInt(input);
    if (isNaN(numberVersion)) {
      return;
    }

    if (numberVersion > stockLimit) {
      setStockInput(stockLimit.toString());
      return setStock(stockLimit);
    }

    const validInput = numberVersion.toString();

    setStockInput(validInput);
    setStock(numberVersion);
  };

  const handleCreateButton = () => {
    if (collectibleType === "event") {
      if (!stock || loading || !isVerified) return;
      Keyboard.dismiss();
      setBottomModalType("createEventWarning");
      informationModalRef.current?.present();
    } else if (collectibleType === "trade") {
      if (
        !stock ||
        !price ||
        loading ||
        !isVerified ||
        identityDocData?.status !== "verified"
      )
        return;
      Keyboard.dismiss();
      setBottomModalType("createTradeWarning");
      informationModalRef.current?.present();
    } else {
      return;
    }
  };

  const handleConfirmButton = async () => {
    if (!stockLimit) return;

    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return console.error("No user");

    if (!stock) return;

    if (stock > stockLimit) return;

    if (loading) return;

    if (collectibleType == "trade") {
      if (!price) return;

      if (identityDocData?.status !== "verified") return;

      setLoading(true);

      try {
        const idToken = await currentUserAuthObject.getIdToken();
        const { token: appchecktoken } = await appCheck().getLimitedUseToken();

        const response = await fetch(
          apiRoutes.collectible.tradeBased.createCollectible,
          {
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
          }
        );

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
    } else if (collectibleType === "event") {
      setLoading(true);

      try {
        const idToken = await currentUserAuthObject.getIdToken();
        const { token: appchecktoken } = await appCheck().getLimitedUseToken();

        const response = await fetch(
          apiRoutes.collectible.eventBased.createCollectible,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${idToken}`,
              appchecktoken,
            },
            body: JSON.stringify({
              postDocPath: postDocPath,
              stock: stock,
            }),
          }
        );

        if (!response.ok) {
          console.error(
            "Response from eventBasedCollectibleCreate api is not okay: \n",
            await response.text()
          );
          return setLoading(false);
        }

        informationModalRef.current?.dismiss();

        router.dismiss();

        return setLoading(false);
      } catch (error) {
        console.error("Error on creating event based collectible: ", error);
        return setLoading(false);
      }
    } else {
      return console.error("Collectible type is not valid");
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

  const handlePinkTickInformationPanelButton = () => {
    router.push("/(modals)/getPinkTick");
  };

  const onToggleValueChange = () => {
    setCollectibleType(collectibleType === "trade" ? "event" : "trade");
  };

  const handlePressVerifyIdentity = () => {
    router.push("/(modals)/identity");
  };

  if (!postDocPath) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Post doc path not found</Text>
      </View>
    );
  }

  if (!postData || stockLimit === null || identityDocData === null) {
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
            id="toggle"
            style={{
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 10,
            }}
          >
            <Text
              bold
              style={{
                fontSize: 14,
              }}
            >
              Trade
            </Text>
            <Switch
              trackColor={{ false: apidonPink, true: apidonPink }}
              ios_backgroundColor={apidonPink}
              thumbColor="black"
              onValueChange={onToggleValueChange}
              value={collectibleType === "trade" ? false : true}
            />
            <Text
              bold
              style={{
                fontSize: 14,
              }}
            >
              Event
            </Text>
          </View>

          {collectibleType === "trade" && (
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
          )}

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
              placeholder={`Maximum ${stockLimit}`}
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

          {collectibleType === "trade" &&
            identityDocData.status !== "verified" && (
              <Pressable
                onPress={handlePressVerifyIdentity}
                id="verification-info"
                style={{
                  backgroundColor: "rgba(255,255,255,0.075)",
                  width: "100%",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderRadius: 20,
                  padding: 15,
                  flexDirection: "row",
                }}
              >
                <AntDesign name="arrowright" size={18} color="yellow" />
                <Text
                  fontSize={12}
                  style={{
                    color: "yellow",
                    textDecorationLine: "underline",
                  }}
                >
                  You need to verify yourself to sell collectibles.
                </Text>
                <AntDesign name="arrowleft" size={18} color="yellow" />
              </Pressable>
            )}

          {!isVerified && (
            <Pressable
              onPress={handlePinkTickInformationPanelButton}
              id="verification-info"
              style={{
                backgroundColor: "rgba(255,255,255,0.075)",
                width: "100%",
                justifyContent: "space-between",
                alignItems: "center",
                borderRadius: 20,
                padding: 15,
                flexDirection: "row",
              }}
            >
              <AntDesign name="arrowright" size={18} color="yellow" />
              <Text
                fontSize={12}
                style={{
                  color: "yellow",
                  textDecorationLine: "underline",
                }}
              >
                You need to have Pink Tick to create collectibles.
              </Text>
              <AntDesign name="arrowleft" size={18} color="yellow" />
            </Pressable>
          )}

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
              disabled={loading || !price || !stock || !isVerified}
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
                  You can set a maximum of {stockLimit} stock for each
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
            {bottomModalType === "createTradeWarning" && (
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
                <Text fontSize={13} bold>
                  Review and confirm your creation.
                </Text>
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
            {bottomModalType === "createEventWarning" && (
              <>
                <Text fontSize={18} bold>
                  Confirm Creation
                </Text>
                <Text fontSize={13}>
                  You are about to create a event collectible with a stock of{" "}
                  {stock}.
                </Text>
                <Text fontSize={13}>
                  Please note that once listed, this collectible cannot be
                  deleted by yourself, and you won't be able to change the
                  stock.
                </Text>

                <Text fontSize={13}>
                  Codes for event will be showed after creation..
                </Text>

                <Text fontSize={13} bold>
                  Review and confirm your creation.
                </Text>
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
