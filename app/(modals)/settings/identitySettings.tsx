import Text from "@/components/Text/Text";
import { FontAwesome } from "@expo/vector-icons";
import {
  IdentityVerificationSheetOptions,
  useStripeIdentity,
} from "@stripe/stripe-identity-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import apiRoutes from "@/helpers/ApiRoutes";
import { useAuth } from "@/providers/AuthProvider";
import { UserIdentityDoc } from "@/types/Identity";
import appCheck from "@react-native-firebase/app-check";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

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

  const { present, loading } = useStripeIdentity(
    getIdentityVerificationSheetOptions
  );

  const handlePress = React.useCallback(() => {
    present();
  }, [present]);

  const { authStatus } = useAuth();

  const [identityDocData, setIdentityDocData] = useState<
    UserIdentityDoc | "not-created" | null
  >(null);

  useEffect(() => {
    if (authStatus !== "authenticated") return;

    const currentUserDisplayname = auth().currentUser?.displayName || "";
    if (!currentUserDisplayname) return;

    const unsubscribe = firestore()
      .doc(`users/${currentUserDisplayname}/personal/identity`)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            const data = doc.data() as UserIdentityDoc;
            setIdentityDocData(data);
          } else {
            setIdentityDocData("not-created");
          }
        },
        (error) => {
          console.error("Error fetching identity data:", error);
          setIdentityDocData(null);
        }
      );

    () => unsubscribe();
  }, [authStatus]);

  if (!identityDocData) {
    return (
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size={50} color="white" />
      </ScrollView>
    );
  }

  if (loading) {
    return (
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          gap: 15,
        }}
      >
        <ActivityIndicator size={50} color="white" />
        <Text>Waiting for results.</Text>
      </ScrollView>
    );
  }

  if (identityDocData === "not-created") {
    return (
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 15,
        }}
      >
        <View
          id="not-created-view"
          style={{
            width: "100%",
            gap: 20,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FontAwesome name="address-card-o" size={100} color="white" />
          <Text
            style={{
              textAlign: "center",
            }}
            fontSize={24}
            bold
          >
            Verify Your Identity
          </Text>
          <Text
            style={{
              textAlign: "center",
            }}
            fontSize={12}
          >
            Please verify your identity to start purchasing or withdrawing.
          </Text>
          <Pressable
            onPress={handlePress}
            style={{
              backgroundColor: "white",
              padding: 10,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color: "black",
              }}
            >
              Start Verification
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 15,
      }}
    >
      {identityDocData.status === "processing" && (
        <View
          id="processing-view"
          style={{
            width: "100%",
            gap: 20,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FontAwesome name="address-card-o" size={100} color="white" />
          <Text fontSize={24} bold>
            Processing
          </Text>
          <Text
            fontSize={12}
            style={{
              textAlign: "center",
            }}
          >
            We're processing your request. This may take a few moments,
          </Text>
        </View>
      )}

      {identityDocData.status === "requires_input" && (
        <View
          id="requiresInput-view"
          style={{
            width: "100%",
            gap: 20,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FontAwesome name="address-card-o" size={100} color="white" />
          <Text fontSize={24} bold>
            Verification Failed
          </Text>
          <Text
            fontSize={12}
            style={{
              textAlign: "center",
              color: "red",
            }}
          >
            We couldn't verify your identity this time. Please double-check your
            information and try again.
          </Text>
          <Pressable
            onPress={handlePress}
            style={{
              backgroundColor: "white",
              padding: 10,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color: "black",
              }}
            >
              Try Again
            </Text>
          </Pressable>
        </View>
      )}

      {identityDocData.status === "verified" && (
        <View
          id="verified"
          style={{
            width: "100%",
            gap: 20,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FontAwesome name="address-card-o" size={100} color="white" />
          <Text fontSize={24} bold>
            Identity Verified
          </Text>
          <Text
            fontSize={12}
            style={{
              color: "green",
              textAlign: "center",
            }}
          >
            Your identity has been verified, and you now have full access to all
            the features of our app.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default identity;
