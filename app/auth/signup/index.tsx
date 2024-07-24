import { apidonPink } from "@/constants/Colors";
import apiRoutes from "@/helpers/ApiRoutes";
import { Link, router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Keyboard,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import appCheck from "@react-native-firebase/app-check";

const index = () => {
  const [referralCode, setReferralCode] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const containerRef = useRef<null | View>(null);
  const screenHeight = Dimensions.get("window").height;
  const animatedTranslateValue = useRef(new Animated.Value(0)).current;

  // Keyboard-Layout Change
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      "keyboardWillShow",
      (event) => {
        if (Keyboard.isVisible()) return;

        const keyboardHeight = event.endCoordinates.height;

        if (containerRef.current) {
          containerRef.current.measure((x, y, width, height, pageX, pageY) => {
            const containerBottom = pageY + height;
            const distanceFromBottom = screenHeight - containerBottom;

            let toValue = 0;
            if (distanceFromBottom > keyboardHeight) {
              toValue = 0;
            } else {
              toValue = keyboardHeight - distanceFromBottom;
            }

            Animated.timing(animatedTranslateValue, {
              toValue: -toValue,
              duration: 250,
              useNativeDriver: true,
            }).start();
          });
        }
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      "keyboardWillHide",
      (event) => {
        let toValue = 0;

        Animated.timing(animatedTranslateValue, {
          toValue: toValue,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const handleReferralCodeChange = (input: string) => {
    setError("");
    setReferralCode(input);
  };

  const getReferralCodeStatus = async (referralCodeInput: string) => {
    try {
      const { token: appchecktoken } = await appCheck().getLimitedUseToken();

      const response = await fetch(
        apiRoutes.user.authentication.signup.checkReferralCode,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            appchecktoken,
          },
          body: JSON.stringify({
            referralCode: referralCodeInput,
          }),
        }
      );

      if (!response.ok) {
        const message = await response.text();

        console.error(
          "Error on fetching to checkReferralCode API from apidon-user side: ",
          message
        );

        setError(message);

        return false;
      }

      return true;
    } catch (error) {
      console.error("Error on fetching to checkReferralCode API: ", error);
      return false;
    }
  };

  const handleContinueButton = async () => {
    if (loading) return;

    Keyboard.dismiss();

    setLoading(true);

    const referralCodeStatus = await getReferralCodeStatus(referralCode);

    const encodedReferralCode = encodeURI(referralCode);

    if (referralCodeStatus)
      router.push(
        `/auth/signup/secondPhase?referralCode=${encodedReferralCode}`
      );

    setLoading(false);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          justifyContent: "center",
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={{
            ...styles.container,
            transform: [{ translateY: animatedTranslateValue }],
          }}
          ref={containerRef}
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
            onSubmitEditing={handleContinueButton}
            autoFocus
          />
          <Pressable
            style={styles.continueButton}
            onPress={handleContinueButton}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Continue
              </Text>
            )}
          </Pressable>

          {error && (
            <Text
              style={{
                color: "red",
                fontSize: 14,
                fontWeight: "bold",
              }}
            >
              {error}
            </Text>
          )}

          <View style={styles.loginView}>
            <Text style={{ color: "white" }}>Already have account?</Text>
            <Link style={{ color: apidonPink }} href="/auth/login">
              Log In!
            </Link>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    padding: 15,
  },
  logoImage: {
    height: "20%",
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
    width: "100%",
    backgroundColor: apidonPink,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 10,
  },
  loginView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
  },
});

export default index;
