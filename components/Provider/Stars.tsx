import { View, Text, Pressable, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import auth from "@react-native-firebase/auth"
import apiRoutes from "@/helpers/ApiRoutes";

type Props = {
  userScore: number;
  size: number;
  changingProvider: boolean;
};

const Stars = (props: Props) => {
  const [userRate, setUserRate] = useState(props.userScore);
  const [loading, setLoading] = useState(false);

  const handlePressStars = async (index: number) => {
    if (props.changingProvider) return;

    if (loading) return;

    const initialValue = userRate;

    setLoading(true);

    setUserRate(index + 1);

    const sendRateResult = await handleSendRate(index + 1);
    if (!sendRateResult) setUserRate(initialValue);

    setLoading(false);
  };

  const handleSendRate = async (score: number) => {
    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return false;

    try {
      const idToken = await currentUserAuthObject.getIdToken();
      const response = await fetch(apiRoutes.provider.rateProvider, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          score: score,
        }),
      });
      if (!response.ok) {
        const message = await response.text();
        console.error("Response from rateProvider API is not okay: ", message);
        return false;
      }

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  return (
    <View style={{ flexDirection: "row", gap: 5 }}>
      {loading ? (
        <ActivityIndicator
          style={{
            height: props.size,
            width: props.size,
          }}
        />
      ) : (
        <>
          {Array.from({ length: 5 }, (_, i) => (
            <Pressable
              disabled={props.changingProvider}
              key={i}
              onPress={() => {
                handlePressStars(i);
              }}
            >
              <AntDesign
                name={i < userRate ? "star" : "staro"}
                size={props.size}
                color="white"
              />
            </Pressable>
          ))}
        </>
      )}
    </View>
  );
};

export default Stars;
