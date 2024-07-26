import { Text } from "@/components/Text/Text";
import { Entypo, Ionicons } from "@expo/vector-icons";
import auth from "@react-native-firebase/auth";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";

const forgotPassword = () => {
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [email, setEmail] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const errorOpacity = useRef(new Animated.Value(1)).current;
  const buttonOpactiy = useRef(new Animated.Value(1)).current;
  const resetEmailTextOpacity = useRef(new Animated.Value(0)).current;

  const [buttonActiveStatus, setButtonActiveStatus] = useState(false);

  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Continue Button Status Handling
  useEffect(() => {
    const buttonActiveStatusDetermined =
      !loading && isEmailValid && !resetEmailSent;

    setButtonActiveStatus(buttonActiveStatusDetermined);
  }, [isEmailValid, loading, resetEmailSent]);

  // Continue Button Opacity Handling
  useEffect(() => {
    if (buttonActiveStatus) {
      changeButtonOpacity(1);
    } else {
      changeButtonOpacity(0.5);
    }
  }, [buttonActiveStatus]);

  // Error Opacity Handling
  useEffect(() => {
    if (email.length === 0) {
      changeErrorOpacity(0);
    } else if (error.length === 0) {
      changeErrorOpacity(0);
    } else {
      changeErrorOpacity(1);
    }
  }, [error, email]);

  // Link sent description Opacity Handling
  useEffect(() => {
    if (resetEmailSent) {
      changeDescriptionOpacity(1);
    } else {
      changeDescriptionOpacity(0);
    }
  }, [resetEmailSent]);

  const changeDescriptionOpacity = (toValue: number) => {
    Animated.timing(resetEmailTextOpacity, {
      toValue: toValue,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const changeButtonOpacity = (toValue: number) => {
    Animated.timing(buttonOpactiy, {
      toValue: toValue,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const handleEmailChange = (input: string) => {
    const lowercasedInput = input.toLowerCase().trim();

    setEmail(lowercasedInput);
    setError("");
    setResetEmailSent(false);

    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@(gmail\.com|icloud\.com|yahoo\.com|outlook\.com)$/i;
    const emailRegexTestResult = emailRegex.test(lowercasedInput);

    setIsEmailValid(emailRegexTestResult);

    if (!emailRegexTestResult) {
      setError("Please enter a valid email address.");
    } else {
      setError("");
    }
  };

  const handleContinueButton = async () => {
    if (!isEmailValid || loading) return;

    setLoading(true);

    try {
      await auth().sendPasswordResetEmail(email);
      setResetEmailSent(true);

      return setLoading(false);

      // Good to go...
    } catch (error) {
      console.error("Error on sending password reset email: ", error);
      return setError("Invalid Email Address");
    }
  };

  const changeErrorOpacity = (toValue: number) => {
    Animated.timing(errorOpacity, {
      toValue: toValue,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flex: 1,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={{
          flex: 1,
          padding: 20,
          gap: 20,
        }}
      >
        <View
          id="enter-code-header"
          style={{
            gap: 10,
          }}
        >
          <Text fontSize={32} bold>
            Reset Your Password
          </Text>
          <Text
            style={{
              color: "gray",
            }}
          >
            Please enter your email below to get password reset link.
          </Text>
        </View>
        <View id="email" style={{ gap: 10 }}>
          <Text bold>Email</Text>
          <View
            style={{
              position: "relative",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "white",
              borderRadius: 10,
            }}
          >
            <View id="input" style={{ paddingRight: 40 }}>
              <TextInput
                style={[
                  {
                    width: "100%",
                    height: 45,
                    color: "white",
                    padding: 10,
                  },
                  {
                    borderColor:
                      isEmailValid || email.length === 0 ? "white" : "red",
                  },
                ]}
                placeholder="Email"
                placeholderTextColor="#808080"
                autoCapitalize="none"
                keyboardType="default"
                value={email}
                onChangeText={handleEmailChange}
              />
            </View>

            <View
              id="indicator"
              style={{
                position: "absolute",
                right: 10,
              }}
            >
              {email.length === 0 ? (
                <></>
              ) : isEmailValid ? (
                <Ionicons name="checkmark-circle" size={24} color="green" />
              ) : (
                <Entypo name="circle-with-cross" size={24} color="red" />
              )}
            </View>
          </View>
        </View>

        <Animated.View
          style={{
            width: "100%",
            alignItems: "center",
            opacity: buttonOpactiy,
          }}
        >
          <Pressable
            disabled={!buttonActiveStatus || resetEmailSent}
            id="continue-button"
            style={{
              backgroundColor: "white",
              borderRadius: 10,
              padding: 10,
              width: "50%",
              alignItems: "center",
            }}
            onPress={handleContinueButton}
          >
            {loading ? (
              <ActivityIndicator color="black" />
            ) : (
              <Text
                style={{
                  color: "black",
                }}
              >
                {resetEmailSent ? "Sent" : "Continue"}
              </Text>
            )}
          </Pressable>
        </Animated.View>

        {resetEmailSent && (
          <Animated.View
            id="link-set-message"
            style={{
              alignItems: "center",
              justifyContent: "center",
              height: 50,
              opacity: resetEmailTextOpacity,
            }}
          >
            <Text
              bold
              style={{
                color: "#90EE90",
                textAlign: "center",
              }}
              fontSize={12}
            >
              A password reset link has been sent to your email; please follow
              the instructions to reset your password.
            </Text>
          </Animated.View>
        )}

        {!resetEmailSent && (
          <Animated.View
            id="error"
            style={{
              alignItems: "center",
              justifyContent: "center",
              height: 50,
              opacity: errorOpacity,
            }}
          >
            <Text
              style={{
                color: "red",
                textAlign: "center",
              }}
              fontSize={12}
            >
              {error}
            </Text>
          </Animated.View>
        )}
      </View>
    </ScrollView>
  );
};

export default forgotPassword;
