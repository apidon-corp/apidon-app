import { apidonPink } from "@/constants/Colors";
import { auth } from "@/firebase/client";
import { router, useLocalSearchParams } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const password = () => {
  const [password, setPassword] = useState("");

  const { email, username } = useLocalSearchParams<{
    email: string;
    username: string;
  }>();

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

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
      await signInWithEmailAndPassword(auth, decodedEmail as string, password);
    } catch (error) {
      console.error("Error during login: ", error);
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
      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        extraHeight={200}
        keyboardShouldPersistTaps="handled"
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
        />

        <Pressable
          style={styles.loginButton}
          onPress={handleLoginButton}
          disabled={loading}
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
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    gap: 20,
  },
  logoImage: {
    height: "12%",
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
    marginTop: 20,
  },
});

export default password;
