import {
  View,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { AntDesign } from "@expo/vector-icons";
import Text from "@/components/Text/Text";
import {
  IdentityVerificationSheetOptions,
  useStripeIdentity,
} from "@stripe/stripe-identity-react-native";

import auth from "@react-native-firebase/auth";
import appCheck from "@react-native-firebase/app-check";
import apiRoutes from "@/helpers/ApiRoutes";

const identity = () => {
  const getIdentityVerificationSheetOptions = async () => {
    const failedSheetOptions: IdentityVerificationSheetOptions = {
      brandLogo: Image.resolveAssetSource(require("@/assets/images/logo.png")),
      ephemeralKeySecret: "",
      sessionId: "",
    };

    const currentUserAuthObject = auth().currentUser;

    if (!currentUserAuthObject) {
      console.error("User is not authenticated to verify himself.");
      return failedSheetOptions;
    }

    try {
      const idToken = await currentUserAuthObject.getIdToken();
      const { token: appchecktoken } = await appCheck().getLimitedUseToken();

      const route = apiRoutes.identity.createVerificationSession;

      const response = await fetch(route, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
          appchecktoken,
        },
      });

      if (!response.ok) {
        console.error("Failed to create verification session.");
        return failedSheetOptions;
      }

      const result = await response.json();

      const sheetOptions: IdentityVerificationSheetOptions = {
        ephemeralKeySecret: result.ephemeralKeySecret,
        sessionId: result.verficationSessionId,
        brandLogo: Image.resolveAssetSource(
          require("@/assets/images/logo.png")
        ),
      };

      return sheetOptions;
    } catch (error) {
      console.error("Error creating verification session:", error);
      return failedSheetOptions;
    }
  };

  const { status, present, loading } = useStripeIdentity(
    getIdentityVerificationSheetOptions
  );

  const handlePress = React.useCallback(() => {
    present();
  }, [present]);

  return (
    <ScrollView
      contentContainerStyle={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 15,
        gap: 15,
      }}
    >
      <View
        id="card-image"
        style={{
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <AntDesign name="idcard" size={100} color="white" />
      </View>
      <View id="description">
        <Text
          fontSize={10}
          style={{
            textAlign: "center",
          }}
        >
          To ensure the safety and security of our community, we require a quick
          identity verification. This step helps us protect your account and
          maintain a trusted environment for all users. The process is simple
          and secure—just follow the on-screen instructions, and you'll be ready
          to enjoy the full features of our app in no time.
        </Text>
      </View>
      <View id="verify-button">
        <Pressable
          disabled={loading}
          onPress={handlePress}
          style={{
            backgroundColor: "white",
            padding: 10,
            borderRadius: 10,
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator color="black" size={14} />
          ) : (
            <Text
              style={{
                color: "black",
              }}
            >
              Verify
            </Text>
          )}
        </Pressable>
      </View>
      <View id="status">
        <Text>{status}</Text>
      </View>
    </ScrollView>
  );
};

export default identity;
