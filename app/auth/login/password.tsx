import { auth } from "@/firebase/client";
import { useLocalSearchParams } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import {
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

const password = () => {
  const [password, setPassword] = useState("");

  const { email, username } = useLocalSearchParams<{
    email: string;
    username: string;
  }>();

  const [error, setError] = useState("");

  const handleLoginButton = async () => {
    if (!email || !username) {
      console.error("Email or username is missing");
      console.error("Email: ", email, "Username: ", username);
      setError("Internal Error");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email as string, password);
      return;
    } catch (error) {
      console.error("Error during login: ", error);
      setError("Invalid Password");
      return;
    }
  };

  const handlePasswordChage = (input: string) => {
    setPassword(input);
    setError("");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Image
          style={styles.logoImage}
          source={require("@/assets/images/logo.png")}
        />
        <View style={styles.helloAgainContainer}>
          <Text style={styles.helloText}>Hello again</Text>
          <Text style={styles.nameText}>{username}</Text>
          <Text style={styles.helloText}>!</Text>
        </View>
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
        {error && <Text style={styles.error}>{error}</Text>}
        <Pressable style={styles.loginButton} onPress={handleLoginButton}>
          <Text
            style={{ color: "white", textAlign: "center", fontWeight: "bold" }}
          >
            Log In
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
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
    backgroundColor: "black",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#d53f8cd9",
  },
});

export default password;
