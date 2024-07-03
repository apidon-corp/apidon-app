import { ActiveProviderInformation } from "@/types/Provider";
import { Image } from "expo-image";
import React from "react";
import { View } from "react-native";
import { Text } from "@/components/Text/Text";
import { MaterialIcons } from "@expo/vector-icons";
import { apidonPink } from "@/constants/Colors";
import Stars from "./Stars";

type Props = {
  activeProviderData: ActiveProviderInformation;
  changingProvider: boolean;
};

const ActiveProviderCard = ({
  activeProviderData,
  changingProvider,
}: Props) => {
  return (
    <View
      style={{
        width: "100%",
        backgroundColor: "rgba(255,255,255,0.1)",
        borderWidth: 3,
        borderColor: apidonPink,
        borderRadius: 10,
        padding: 10,
        gap: 20,
      }}
    >
      <View style={{ flexDirection: "row" }}>
        <Image
          source={activeProviderData.image}
          style={{
            width: 180,
            height: 180,
            borderRadius: 10,
          }}
        />
        <View
          style={{
            height: 180,
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              height: 180,
              paddingVertical: 3,
              width: "70%",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                gap: 5,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <Text
                  bold
                  style={{
                    fontSize: 20,
                  }}
                >
                  {activeProviderData.name}
                </Text>
                <MaterialIcons name="verified" size={24} color={apidonPink} />
              </View>
              <Text
                bold
                style={{
                  color: "#808080",
                }}
              >
                {activeProviderData.description}
              </Text>
            </View>

            <View>
              <Text bold>Client Count</Text>
              <Text
                style={{
                  color: apidonPink,
                }}
                bold
              >
                {activeProviderData.clientCount}
              </Text>
            </View>

            <View>
              <Text bold>Score</Text>
              <Text
                bold
                style={{
                  color: apidonPink,
                }}
              >
                {activeProviderData.score.toFixed(1)}/5
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text bold>Overall Profit</Text>
          <Text bold style={{ color: apidonPink }}>
            ${activeProviderData.offer}
          </Text>
        </View>
        <View>
          <Stars
            size={28}
            userScore={activeProviderData.userScore}
            changingProvider={changingProvider}
          />
        </View>
      </View>
    </View>
  );
};

export default ActiveProviderCard;