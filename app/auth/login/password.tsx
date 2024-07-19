import { apidonPink } from "@/constants/Colors";
import { useAuth } from "@/providers/AuthProvider";
import { router, useLocalSearchParams } from "expo-router";
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

import auth from "@react-native-firebase/auth";

import * as Sentry from "@sentry/react-native";

const password = () => {
  const authStatus = useAuth();

  const [password, setPassword] = useState("");

  const { email, username } = useLocalSearchParams<{
    email: string;
    username: string;
  }>();

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const containerRef = useRef<null | View>(null);
  const screenHeight = Dimensions.get("window").height;
  const animatedTranslateValue = useRef(new Animated.Value(0)).current;

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
  }, [containerRef.current]);

  const handleLoginButton = async () => {
    if (!email || !username) {
      console.error("Email or username is missing");
      console.error("Email: ", email, "Username: ", username);
      setError("Internal Error");
      return;
    }

    if (loading) return;
    setLoading(true);

    const decodedEmail = decodeURI(email);

    try {
      await auth().signInWithEmailAndPassword(decodedEmail as string, password);
    } catch (error) {
      console.error("Error during login: \n", error);
      Sentry.captureException(
        `Error happened on pressing 'login' button on login after entering password:\n${error}`
      );
      setError("Invalid Password");
    }

    setLoading(false);
  };

  const handlePasswordChage = (input: string) => {
    setPassword(input);
    setError("");
  };

  const handleResetPasswordLink = () => {
    router.push("/auth/login/passwordReset");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
          <Text style={styles.helloText}>
            Hello Again{" "}
            <Text
              style={{
                color: apidonPink,
              }}
            >
              {username && decodeURI(username)}
            </Text>
            !
          </Text>
          <Text style={styles.secureText}>
            Now, to securely access your Apidon account, please enter your
            password.
          </Text>
          <TextInput
            style={styles.passworInput}
            placeholder="Password"
            placeholderTextColor="#808080"
            autoCapitalize="none"
            keyboardType="email-address"
            value={password}
            onChangeText={handlePasswordChage}
            secureTextEntry={true}
            onSubmitEditing={handleLoginButton}
          />

          <Pressable
            style={styles.loginButton}
            onPress={handleLoginButton}
            disabled={loading}
          >
            {loading || authStatus === "loading" ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Log In
              </Text>
            )}
          </Pressable>

          {error && <Text style={styles.error}>{error}</Text>}
          <Pressable onPress={handleResetPasswordLink}>
            <View style={styles.forgotView}>
              <Text style={{ color: "white" }}>Forgot password?</Text>
              <Text style={{ color: apidonPink }}>Reset!</Text>
            </View>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    gap: 20,
  },
  logoImage: {
    height: "20%",
    aspectRatio: 1,
  },
  helloAgainContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  helloText: {
    fontSize: 25,
    color: "white",
    fontWeight: "bold",
  },
  nameText: {
    fontSize: 25,
    color: "cyan",
    fontWeight: "bold",
  },
  secureText: {
    color: "#718096",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "bold",
  },
  passworInput: {
    width: "100%",
    height: 45,
    color: "white",
    backgroundColor: "black",
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 10,
    padding: 10,
  },
  error: {
    color: "red",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "bold",
  },
  loginButton: {
    width: "100%",
    backgroundColor: apidonPink,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 10,
  },
  forgotView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
  },
});

export default password;
