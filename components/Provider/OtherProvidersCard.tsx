import { Pressable, View } from "react-native";
import { Text } from "@/components/Text/Text";
import React, { useState } from "react";
import { IProviderShowcaseItem } from "@/types/Provider";
import { Image } from "expo-image";
import { apidonPink } from "@/constants/Colors";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";

type Props = {
  providerData: IProviderShowcaseItem;
};

const OtherProvidersCard = ({ providerData }: Props) => {
  const [showDetails, setShowDetails] = useState(false);

  const handlePressShowDetails = () => {
    setShowDetails(!showDetails);
  };

  const handleChooseButton = async () => {

  };

  return (
    <View
      style={{
        width: "100%",
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 20,
        padding: 10,
      }}
    >
      <View
        style={{
          gap: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Image
              source={providerData.image}
              style={{
                width: 100,
                height: 100,
                borderRadius: 20,
              }}
            />
            <View
              style={{
                paddingVertical: 5,
                height: 100,
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  gap: 5,
                }}
              >
                <Text
                  bold
                  style={{
                    fontSize: 18,
                  }}
                >
                  {providerData.name}
                </Text>
                <MaterialIcons name="verified" size={24} color={apidonPink} />
              </View>

              <Text
                bold
                style={{
                  color: "gray",
                }}
              >
                {providerData.clientCount} Users
              </Text>
              <Text bold style={{ color: apidonPink }}>
                ${providerData.offer}
              </Text>
            </View>
          </View>

          <View
            style={{
              justifyContent: "space-between",
            }}
          >
            <Pressable
              style={{ alignItems: "flex-end" }}
              onPress={handlePressShowDetails}
            >
              <MaterialIcons
                name={showDetails ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                size={28}
                color="gray"
              />
            </Pressable>
            <View
              style={{
                flexDirection: "row",
                gap: 5,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AntDesign name={"star"} size={28} color="white" />
              <Text bold style={{ fontSize: 24 }}>
                {providerData.score.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>
        {showDetails && (
          <View
            style={{
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              gap: 15,
            }}
          >
            <Text
              bold
              style={{
                color: "gray",
              }}
            >
              {providerData.description}
            </Text>
            <Pressable
              style={{
                padding: 10,
                paddingHorizontal: 20,
                borderWidth: 1,
                borderRadius: 10,
                borderColor: apidonPink,
              }}
            >
              <Text bold style={{ color: apidonPink }}>
                Choose
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
};

export default OtherProvidersCard;
