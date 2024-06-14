import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Image,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { Link, router } from "expo-router";
import { CheckReferralCodeApiResponseBody } from "@/types/ApiResponses";

type Props = {};

const index = (props: Props) => {
  const [referralCode, setReferralCode] = useState("");

  const [referralCodeStatus, setReferralCodeStatus] = useState(false);

  const handleReferralCodeChange = (input: string) => {
    setReferralCode(input);
    if (input.length > 0) handleGetReferralCodeStatus(input);
  };

  const handleGetReferralCodeStatus = async (referralCodeInput: string) => {
    try {
      const userPanelBaseUrl = process.env.EXPO_PUBLIC_USER_PANEL_ROOT_URL;
      if (!userPanelBaseUrl) {
        console.error("User panel base url couldnt fetch from .env file");
        return false;
      }

      const userPanelApiKey = process.env.EXPO_PUBLIC_USER_PANEL_API_KEY;
      if (!userPanelApiKey) {
        console.error("User panel api key couldnt fetch from .env file");
        return false;
      }

      const fetchUrl = `${userPanelBaseUrl}/api/user/authentication/signup/checkReferralCode`;

      const response = await fetch(fetchUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: userPanelApiKey,
        },
        body: JSON.stringify({
          referralCode: referralCodeInput,
        }),
      });

      if (!response.ok) {
        console.error(
          "Error on fetching to checkReferralCode API from apidon-user side: ",
          await response.text()
        );
        return false;
      }

      const result =
        (await response.json()) as CheckReferralCodeApiResponseBody;

      if (result.referralCodeStatus === "invalid")
        return setReferralCodeStatus(false);

      return setReferralCodeStatus(true);
    } catch (error) {
      console.error("Error on fetching to checkReferralCode API: ", error);
      setReferralCodeStatus(false);
      return false;
    }
  };

  const handleContinueButton = () => {
    if (!referralCodeStatus) return;
    router.push(`/auth/signup/secondPhase?referralCode=${referralCode}`);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Image
          style={styles.logoImage}
          source={require("@/assets/images/logo.png")}
        />
        <Text style={styles.join}>Join Apidon</Text>
        <Text style={styles.continueText}>
          To continue, please enter your referral code. You'll be prompted for
          your email and password on the next screen.
        </Text>
        <TextInput
          style={styles.referralInput}
          placeholder="Referral Code"
          placeholderTextColor="#808080"
          autoCapitalize="none"
          keyboardType="email-address"
          value={referralCode}
          onChangeText={handleReferralCodeChange}
        />
        <Pressable style={styles.continueButton} onPress={handleContinueButton}>
          <Text
            style={{ color: "white", textAlign: "center", fontWeight: "bold" }}
          >
            Continue
          </Text>
        </Pressable>
        <View style={styles.loginView}>
          <Text style={{ color: "white" }}>Don't have account?</Text>
          <Link style={{ color: "cyan" }} href="/auth/login">
            Log In!
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    padding: 15,
  },
  logoImage: {
    height: "12%",
    aspectRatio: 1,
  },
  join: {
    color: "white",
    fontSize: 25,
    textAlign: "center",
    fontWeight: "bold",
  },
  continueText: {
    color: "#718096",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "bold",
  },
  referralInput: {
    width: "100%",
    height: 45,
    color: "white",
    backgroundColor: "black",
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 10,
    padding: 10,
  },
  continueButton: {
    width: "50%",
    backgroundColor: "black",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#d53f8cd9",
  },
  loginView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    marginTop: 20,
  },
});

export default index;
