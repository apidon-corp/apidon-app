import { ActivityIndicator, Alert, Pressable, View } from "react-native";
import { Text } from "@/components/Text/Text";
import React, { Dispatch, SetStateAction, useState } from "react";
import { IProviderShowcaseItem } from "@/types/Provider";
import { Image } from "expo-image";
import { apidonPink } from "@/constants/Colors";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { auth } from "@/firebase/client";

type Props = {
  providerData: IProviderShowcaseItem;
  changingProvider: boolean;
  setChangingProvider: Dispatch<SetStateAction<boolean>>;
};

const OtherProvidersCard = ({
  changingProvider,
  providerData,
  setChangingProvider,
}: Props) => {
  const [showDetails, setShowDetails] = useState(false);

  const handlePressShowDetails = () => {
    setShowDetails(!showDetails);
  };

  const handleChangeProvider = async () => {
    const currentUserAuthObject = auth.currentUser;
    if (!currentUserAuthObject) return false;

    const userPanelBaseUrl = process.env.EXPO_PUBLIC_USER_PANEL_ROOT_URL;
    if (!userPanelBaseUrl) {
      console.error("User panel base url couldnt fetch from .env file");
      return false;
    }

    if (changingProvider) return;

    const route = `${userPanelBaseUrl}/api/provider/selectProvider`;

    setChangingProvider(true);

    try {
      const idToken = await currentUserAuthObject.getIdToken();
      const response = await fetch(route, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          providerName: providerData.name,
        }),
      });

      if (!response.ok) {
        console.error(
          "Response from changeProvider API is not okay: ",
          await response.text()
        );
        return setChangingProvider(false);
      }

      return setChangingProvider(false);
    } catch (error) {
      console.error("Error on change provider: ", error);
      return setChangingProvider(false);
    }
  };

  const handleChooseButton = () => {
    Alert.alert(
      "Change Provider",
      `Are you sure you want to change your provider to ${providerData.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Change",
          onPress: handleChangeProvider,
        },
      ]
    );
  };

  return (
    <Pressable
      onPress={handlePressShowDetails}
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
              onPress={handleChooseButton}
              style={{
                padding: 10,
                paddingHorizontal: 20,
                borderWidth: 1,
                borderRadius: 10,
                borderColor: apidonPink,
              }}
              disabled={changingProvider}
            >
              {changingProvider ? (
                <ActivityIndicator color={apidonPink} />
              ) : (
                <Text bold style={{ color: apidonPink }}>
                  Choose
                </Text>
              )}
            </Pressable>
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default OtherProvidersCard;
