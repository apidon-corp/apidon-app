import { handleGetActiveProviderStatus } from "@/providers/ProviderProvider";
import { GetProviderInformationAPIResponseBody } from "@/types/Provider";
import { Image } from "expo-image";
import { Stack, router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Text } from "@/components/Text/Text";
import Stars from "@/components/Provider/Stars";
import * as ProgressBar from "react-native-progress";
import { apidonPink } from "@/constants/Colors";

const provider = () => {
  const [providerData, setProviderData] =
    useState<GetProviderInformationAPIResponseBody | null>(null);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!providerData) return;

    if (!providerData.isThereActiveProvider) return;

    const timer = setTimeout(() => {
      const progressCalc =
        (Date.now() -
          providerData.providerData.additionalProviderData.duration.startTime) /
        (providerData.providerData.additionalProviderData.duration.endTime -
          providerData.providerData.additionalProviderData.duration.startTime);

      setProgress(progressCalc);
    }, 1500);
    return () => {
      clearTimeout(timer);
    };
  }, [providerData]);

  useEffect(() => {
    handleGetActiveProviderStatus().then((res) => {
      if (res) setProviderData(res);
    });
  }, []);

  if (!providerData)
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color="white" size="large" />
      </View>
    );

  if (providerData.isThereActiveProvider) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Active Provider",
          }}
        />
        <View style={{ flex: 1, padding: 10, gap: 20 }}>
          <Text
            bold
            style={{
              fontSize: 20,
              color: "#808080",
              textAlign: "center",
            }}
          >
            Information
          </Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={{ gap: 15 }}>
              <View>
                <Text
                  bold
                  style={{
                    color: "#808080",
                  }}
                >
                  Name
                </Text>
                <Text bold>
                  {providerData.providerData.additionalProviderData.name}
                </Text>
              </View>
              <View>
                <Text
                  bold
                  style={{
                    color: "#808080",
                  }}
                >
                  Description
                </Text>
                <Text bold>
                  {providerData.providerData.additionalProviderData.description}
                </Text>
              </View>
              <View>
                <Text
                  bold
                  style={{
                    color: "#808080",
                  }}
                >
                  Client Count
                </Text>
                <Text bold>
                  {providerData.providerData.additionalProviderData.clientCount}
                </Text>
              </View>
              <View>
                <Text
                  bold
                  style={{
                    color: "#808080",
                  }}
                >
                  Score
                </Text>
                <Text bold>
                  {providerData.providerData.additionalProviderData.score.toFixed(
                    2
                  )}{" "}
                  - 5
                </Text>
              </View>
            </View>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={providerData.providerData.additionalProviderData.image}
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 10,
                }}
                transition={500}
              />
            </View>
          </View>
          <View
            style={{
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
            }}
          >
            <Text
              bold
              style={{
                fontSize: 20,
                color: "#808080",
              }}
            >
              Rate
            </Text>
            <Stars
              userScore={
                providerData.providerData.additionalProviderData.userScore
              }
            />
          </View>
          <View
            style={{
              width: "100%",
              alignItems: "center",
              gap: 20,
            }}
          >
            <Text
              bold
              style={{
                fontSize: 20,
                color: "#808080",
                textAlign: "center",
              }}
            >
              Award
            </Text>

            <ProgressBar.Circle showsText size={96} progress={progress} />

            <View style={{ alignItems: "center" }}>
              <Text
                bold
                style={{
                  color: "#808080",
                }}
              >
                Prize
              </Text>
              <Text
                bold
                style={{
                  color: "white",
                }}
              >
                {providerData.providerData.additionalProviderData.yield} MATIC
              </Text>
            </View>
          </View>
          <View
            style={{
              alignItems: "center",
            }}
          >
            <Pressable
              onPress={() => {
                router.push("/provider/chooseProvider");
              }}
              style={{
                padding: 10,
                backgroundColor: apidonPink,
                borderRadius: 10,
                width: 200,
              }}
            >
              <Text
                bold
                style={{
                  textAlign: "center",
                }}
              >
                Change Provider
              </Text>
            </Pressable>
          </View>
        </View>
      </>
    );
  }

  return (
    <View>
      <Text>provider</Text>
    </View>
  );
};

export default provider;
