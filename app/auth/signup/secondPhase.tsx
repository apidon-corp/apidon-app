import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  StyleSheet,
  Image,
  Pressable,
} from "react-native";
import React, { useState } from "react";

import { MaterialIcons } from "@expo/vector-icons";

type Props = {};

const secondPhase = (props: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");

  const [error, setError] = useState("");

  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [isFullnameValid, setIsFullnameValid] = useState(true);

  const [passwordStatus, setPasswordStatus] = useState({
    digit: false,
    lowercase: false,
    uppercase: false,
    eightCharacter: false,
    special: false,
  });

  const handleEmailChange = (input: string) => {
    setError("");
    setEmail(input);
    const emailRegex =
      /^[A-Za-z0-9._%+-]+@(gmail|yahoo|outlook|aol|icloud|protonmail|yandex|mail|zoho)\.(com|net|org)$/i;
    const regexTestResult = emailRegex.test(input);
    setIsEmailValid(regexTestResult);
  };

  const handlePasswordChange = async (input: string) => {
    setPassword(input);

    const passwordRegex =
      /^(?=.*?\p{Lu})(?=.*?\p{Ll})(?=.*?\d)(?=.*?[^\w\s]|[_]).{12,}$/u;

    const regexTestResult = passwordRegex.test(input);

    setIsPasswordValid(regexTestResult);

    setPasswordStatus({
      digit: /^(?=.*?\d)/u.test(input),
      lowercase: /^(?=.*?\p{Ll})/u.test(input),
      uppercase: /^(?=.*?\p{Lu})/u.test(input),
      eightCharacter: /^.{12,}$/u.test(input),
      special: /^(?=.*?[^\w\s]|[_])/u.test(input),
    });
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <View style={styles.container}>
        <Image
          style={styles.logoImage}
          source={require("@/assets/images/logo.png")}
        />
        <Text style={styles.join}>Join Apidon</Text>
        <Text style={styles.continueText}>
          To finish sign up, please enter your email, password, username and
          fullname.
        </Text>

        <TextInput
          style={{
            ...styles.input,
            borderColor: isEmailValid ? "white" : "red",
          }}
          placeholder="Email"
          placeholderTextColor="#808080"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={handleEmailChange}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#808080"
          autoCapitalize="none"
          secureTextEntry={true}
          value={password}
          onChangeText={handlePasswordChange}
        />
        {!isPasswordValid && (
          <View
            style={{
              width: "100%",
              gap: 5,
            }}
          >
            {!passwordStatus.digit && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  paddingHorizontal: 20,
                }}
              >
                <MaterialIcons name="error-outline" color="red" size={20} />
                <Text style={{ fontSize: 15, color: "red" }}>
                  Numbers (0-9)
                </Text>
              </View>
            )}
            {!passwordStatus.lowercase && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  paddingHorizontal: 20,
                }}
              >
                <MaterialIcons name="error-outline" color="red" size={20} />
                <Text style={{ fontSize: 15, color: "red" }}>
                  Lower case letters (aa)
                </Text>
              </View>
            )}

            {!passwordStatus.uppercase && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  paddingHorizontal: 20,
                }}
              >
                <MaterialIcons name="error-outline" color="red" size={20} />
                <Text style={{ fontSize: 15, color: "red" }}>
                  Upper case letters (AA)
                </Text>
              </View>
            )}

            {!passwordStatus.special && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  paddingHorizontal: 20,
                }}
              >
                <MaterialIcons name="error-outline" color="red" size={20} />
                <Text style={{ fontSize: 15, color: "red" }}>
                  Special characters (&*%)
                </Text>
              </View>
            )}

            {!passwordStatus.eightCharacter && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  paddingHorizontal: 20,
                }}
              >
                <MaterialIcons name="error-outline" color="red" size={20} />
                <Text style={{ fontSize: 15, color: "red" }}>
                  At least 12 characters
                </Text>
              </View>
            )}
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#808080"
          autoCapitalize="none"
          keyboardType="default"
        />
        <TextInput
          style={styles.input}
          placeholder="Fullname"
          placeholderTextColor="#808080"
          keyboardType="default"
        />

        <Pressable style={styles.signUpButton} onPress={() => {}}>
          <Text
            style={{ color: "white", textAlign: "center", fontWeight: "bold" }}
          >
            Sign Up
          </Text>
        </Pressable>
      </View>
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
  input: {
    width: "100%",
    height: 45,
    color: "white",
    backgroundColor: "black",
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 10,
    padding: 10,
  },
  signUpButton: {
    width: "50%",
    backgroundColor: "black",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#d53f8cd9",
  },
});

export default secondPhase;
