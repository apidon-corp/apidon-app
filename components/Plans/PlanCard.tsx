import { BottomSheetModalData, PlanCardData } from "@/types/Plans";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import React, { useEffect, useRef } from "react";
import { ScrollView, View } from "react-native";
import Text from "../Text/Text";
import FeatureObject from "./FeatureObject";

type Props = {
  planCardData: PlanCardData;
  bottomSheetModalRef: React.RefObject<BottomSheetModalMethods>;
  setBottomSheetData: React.Dispatch<
    React.SetStateAction<BottomSheetModalData>
  >;
  index: number;
  currentIndex: number;
};

const PlanCard = ({
  planCardData,
  bottomSheetModalRef,
  setBottomSheetData,
  index,
  currentIndex,
}: Props) => {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (currentIndex !== index)
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [currentIndex, scrollViewRef]);

  return (
    <ScrollView
      ref={scrollViewRef}
      id="root"
      contentContainerStyle={{
        gap: 15,
        padding: 5,
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
          gap: 15,
        }}
      >
        <Text bold style={{ color: "white" }}>
          Collectibles {planCardData.storeProductId !== "" && "(Monthly)"}
        </Text>

        <View
          id="collectibles-body"
          style={{
            width: "100%",
            gap: 5,
          }}
        >
          <FeatureObject
            title="Create Up to 5"
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
            title="Create Up to 10"
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
            title="Create Up to 50"
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
            title="Create Up to 100"
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
          gap: 15,
        }}
      >
        <Text bold style={{ color: "white" }}>
          Stocks {planCardData.storeProductId !== "" && "(Monthly)"}
        </Text>

        <View
          id="stock-body"
          style={{
            width: "100%",
            gap: 5,
          }}
        >
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
          gap: 15,
        }}
      >
        <Text bold style={{ color: "white" }}>
          Support
        </Text>

        <View
          id="support-body"
          style={{
            width: "100%",
            gap: 5,
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
  );
};

export default PlanCard;
