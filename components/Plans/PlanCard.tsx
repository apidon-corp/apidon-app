import { BottomSheetModalData, PlanCardData } from "@/types/Plans";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import React from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import Purchases from "react-native-purchases";
import Text from "../Text/Text";
import FeatureObject from "./FeatureObject";

import { BlurView } from "@react-native-community/blur";

type Props = {
  currentSubscriptionProductId: string;
  planCardData: PlanCardData;
  bottomSheetModalRef: React.RefObject<BottomSheetModalMethods>;
  setBottomSheetData: React.Dispatch<
    React.SetStateAction<BottomSheetModalData>
  >;
};

const PlanCard = ({
  currentSubscriptionProductId,
  planCardData,
  bottomSheetModalRef,
  setBottomSheetData,
}: Props) => {
  const handleSubscribeButton = async () => {
    if (!planCardData.purchaseStoreProduct) return;

    try {
      await Purchases.purchaseStoreProduct(planCardData.purchaseStoreProduct);
    } catch (error: any) {
      if (error.userCancelled) return console.log("User cancelled");

      Alert.alert("Error", "Error on purchasing product.");
      console.error(
        "Error purchasing product: \n",
        planCardData.purchaseStoreProduct,
        "\n",
        error
      );
      console.error("Error on purchasing:", error);
    }
  };

  return (
    <>
      <ScrollView
        id="root"
        style={{
          marginHorizontal: 2,
        }}
        contentContainerStyle={{
          width: "100%",
          gap: 15,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          id="title-area"
          style={{
            width: "100%",
            padding: 10,
            backgroundColor: "rgba(255,255,255,0.2)",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 10,
          }}
        >
          <Text bold fontSize={18}>
            {planCardData.title}
          </Text>
        </View>

        <View
          id="collectible-details"
          style={{
            width: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            padding: 10,
            borderRadius: 10,
            gap: 10,
          }}
        >
          <Text bold style={{ color: "white" }}>
            Collectibles
          </Text>

          <View
            id="collectibles-body"
            style={{
              width: "100%",
              gap: 8,
            }}
          >
            <FeatureObject
              title="Undo Collectible"
              isChecked={planCardData.collectible.undo}
              bottomSheetModalData={{
                title: "Undo Collectible",
                description:
                  "Allows you to undo the creation of a collectible. This feature helps prevent mistakes during the creation process.",
              }}
              bottomSheetModalRef={bottomSheetModalRef}
              setBottomSheetData={setBottomSheetData}
            />

            <FeatureObject
              title="Create up-to 5"
              isChecked={planCardData.collectible.upToFive}
              bottomSheetModalData={{
                title: "Create Up to 5 Collectibles",
                description:
                  "This feature allows you to create up to 5 collectibles. Ideal for small-scale creators or users who want to try the platform.",
              }}
              bottomSheetModalRef={bottomSheetModalRef}
              setBottomSheetData={setBottomSheetData}
            />

            <FeatureObject
              title="Create up-to 10"
              isChecked={planCardData.collectible.upToTen}
              bottomSheetModalData={{
                title: "Create Up to 10 Collectibles",
                description:
                  "Enables the creation of up to 10 collectibles. Perfect for users looking to expand their collection on a medium scale.",
              }}
              bottomSheetModalRef={bottomSheetModalRef}
              setBottomSheetData={setBottomSheetData}
            />

            <FeatureObject
              title="Create up-to 50"
              isChecked={planCardData.collectible.upToFifthy}
              bottomSheetModalData={{
                title: "Create Up to 50 Collectibles",
                description:
                  "Allows you to create up to 50 collectibles. Suitable for users who have a larger following or want to offer more products.",
              }}
              bottomSheetModalRef={bottomSheetModalRef}
              setBottomSheetData={setBottomSheetData}
            />

            <FeatureObject
              title="Create up-to 100"
              isChecked={planCardData.collectible.upToHundred}
              bottomSheetModalData={{
                title: "Create Up to 100 Collectibles",
                description:
                  "Grants the ability to create up to 100 collectibles. Ideal for power users or large-scale projects.",
              }}
              bottomSheetModalRef={bottomSheetModalRef}
              setBottomSheetData={setBottomSheetData}
            />
          </View>
        </View>

        <View
          id="stock-details"
          style={{
            width: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            padding: 10,
            borderRadius: 10,
            gap: 10,
          }}
        >
          <Text bold style={{ color: "white" }}>
            Stocks
          </Text>

          <View
            id="stock-body"
            style={{
              width: "100%",
              gap: 8,
            }}
          >
            <FeatureObject
              title="Allow Collecting Sold Out"
              isChecked={planCardData.stock.allowCollectingSoldOut}
              bottomSheetModalData={{
                title: "Allow Collecting Sold Out",
                description:
                  "This feature allows users to continue collecting items even after they are marked as sold out. Useful for maintaining engagement with popular items.",
              }}
              bottomSheetModalRef={bottomSheetModalRef}
              setBottomSheetData={setBottomSheetData}
            />

            <FeatureObject
              title="Stock Up to 10"
              isChecked={planCardData.stock.upToTen}
              bottomSheetModalData={{
                title: "Stock Up to 10",
                description:
                  "Allows you to set a stock limit of up to 10 items for a collectible. Ideal for creating exclusive and limited items.",
              }}
              bottomSheetModalRef={bottomSheetModalRef}
              setBottomSheetData={setBottomSheetData}
            />

            <FeatureObject
              title="Stock Up to 50"
              isChecked={planCardData.stock.upToFifty}
              bottomSheetModalData={{
                title: "Stock Up to 50",
                description:
                  "Allows you to set a stock limit of up to 50 items for a collectible. Suitable for reaching a larger audience while maintaining some exclusivity.",
              }}
              bottomSheetModalRef={bottomSheetModalRef}
              setBottomSheetData={setBottomSheetData}
            />

            <FeatureObject
              title="Stock Up to 100"
              isChecked={planCardData.stock.upToHundred}
              bottomSheetModalData={{
                title: "Stock Up to 100",
                description:
                  "Enables setting a stock limit of up to 100 items for a collectible. Perfect for creators looking to engage with a broad audience.",
              }}
              bottomSheetModalRef={bottomSheetModalRef}
              setBottomSheetData={setBottomSheetData}
            />

            <FeatureObject
              title="Stock Up to 1000"
              isChecked={planCardData.stock.upToThousand}
              bottomSheetModalData={{
                title: "Stock Up to 1000",
                description:
                  "Grants the ability to set a stock limit of up to 1000 items for a collectible. Ideal for mass distribution or popular items.",
              }}
              bottomSheetModalRef={bottomSheetModalRef}
              setBottomSheetData={setBottomSheetData}
            />
          </View>
        </View>

        <View
          id="support-details"
          style={{
            width: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            padding: 10,
            borderRadius: 10,
            gap: 10,
          }}
        >
          <Text bold style={{ color: "white" }}>
            Support
          </Text>

          <View
            id="support-body"
            style={{
              width: "100%",
              gap: 8,
            }}
          >
            <FeatureObject
              title="Priority Support"
              isChecked={planCardData.support.priority}
              bottomSheetModalData={{
                title: "Priority Support",
                description:
                  "Gain access to priority support, ensuring your issues and inquiries are addressed promptly by our support team.",
              }}
              bottomSheetModalRef={bottomSheetModalRef}
              setBottomSheetData={setBottomSheetData}
            />
          </View>
        </View>

        <View
          style={{
            display: planCardData.price.price === 0 ? "none" : undefined,
            height: 80,
          }}
        />
      </ScrollView>

      <View
        style={{
          position: "absolute",
          width: "100%",
          bottom: 10,
          justifyContent: "center",
          alignItems: "center",
          padding: 10,
          display:
            planCardData.price.price === 0 ||
            planCardData.purchaseStoreProduct?.identifier ===
              currentSubscriptionProductId
              ? "none"
              : undefined,
        }}
      >
        <BlurView
          blurType="extraDark"
          blurAmount={3}
          reducedTransparencyFallbackColor="white"
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            padding: 10,
            borderRadius: 20,
          }}
        >
          <Pressable
            onPress={handleSubscribeButton}
            style={{
              width: "65%",
              padding: 10,
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text fontSize={16} bold>
              Subscribe for ${planCardData.price.price}
            </Text>
          </Pressable>
        </BlurView>
      </View>
    </>
  );
};

export default PlanCard;
