import {
  View,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  Button,
  TextInput,
} from "react-native";
import { Text } from "@/components/Text/Text";
import React, { useState } from "react";
import apiRoutes from "@/helpers/ApiRoutes";

import appCheck from "@react-native-firebase/app-check";
import { router } from "expo-router";
import auth from "@react-native-firebase/auth";

const additionalInfo = () => {
  const [username, setUsername] = useState("");
  const [isUsernameValid, setIsUsernameValid] = useState(true);

  const [fullname, setFullname] = useState("");
  const [isFullnameValid, setIsFullnameValid] = useState(true);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleUsernameChange = async (input: string) => {
    setError("");

    // Transform input
    input = input
      .toLowerCase()
      .trimEnd()
      .replace(/[^\w\s]$/, "");

    setUsername(input);

    const usernameRegex = /^[a-z0-9]{4,20}$/;
    const isValid = usernameRegex.test(input);
    setIsUsernameValid(isValid);

    if (!isValid) {
      setError(
        "Please enter a username consisting of 4 to 20 characters, using only lowercase letters (a-z) and digits (0-9)."
      );
      return;
    }

    const canUse = await checkUsernameCanBeUsed(input);
    if (!canUse) {
      setIsUsernameValid(false);
    }
  };

  const checkUsernameCanBeUsed = async (username: string) => {
    try {
      const { token: appchecktoken } = await appCheck().getLimitedUseToken();

      const response = await fetch(
        apiRoutes.user.authentication.login.checkThereIsLinkedAccount,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            appchecktoken,
          },
          body: JSON.stringify({ eu: username }),
        }
      );

      if (!response.ok) {
        console.log(
          "Response from ",
          apiRoutes.user.authentication.login.checkThereIsLinkedAccount,
          " is not okay: ",
          await response.text()
        );
        setError("");
        setIsUsernameValid(true);
        return false;
      }

      const { username: usernameFetched, email } = await response.json();

      if (!usernameFetched || !email) {
        setError("");
        setIsUsernameValid(true);
        return true;
      }

      setError("Username is used.");
      setIsUsernameValid(false);
      return false;
    } catch (error) {
      console.error(
        "Error on fetching to checkThereIsLinkedAccount API from apidon-user side: ",
        error
      );
      setError("Internal Server Error");
      setIsUsernameValid(false);
      return false;
    }
  };

  const handleFullnameChange = (input: string) => {
    setError("");
    input = input.replace(/[^\p{L}\p{N}\s]/gu, "");
    setFullname(input);

    const fullnameRegex = /^\p{L}{1,20}(?: \p{L}{1,20})*$/u;
    const regexTestResult = fullnameRegex.test(input);

    setIsFullnameValid(regexTestResult);

    // Explain Error
    if (!regexTestResult)
      setError(
        "Please enter your full name consisting of 3 to 20 characters, using letters and spaces."
      );
  };

  const handleContinueButton = async () => {
    if (loading) return;

    const currentUserAuthObject = auth().currentUser;

    if (!currentUserAuthObject) {
      console.error("User not logged in.");
      setError("You are not logged in.");
      return;
    }

    setLoading(true);

    try {
      const idToken = await currentUserAuthObject.getIdToken();
      const { token: appchecktoken } = await appCheck().getLimitedUseToken();

      const response = await fetch(
        apiRoutes.user.authentication.signup.completeSignUp,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${idToken}`,
            appchecktoken,
          },
          body: JSON.stringify({
            username: username,
            fullname: fullname,
          }),
        }
      );

      if (!response.ok) {
        const errorFromApi = await response.text();

        console.log("Response from route is not okay: ", errorFromApi);
        setError(errorFromApi);
        setLoading(false);
        return;
      }

      console.log("We are checking if user has valid auth object now...");

      const isValidAuthObject = (
        await currentUserAuthObject.getIdTokenResult(true)
      ).claims.isValidAuthObject;

      if (!isValidAuthObject) {
        console.error(
          "User's auth object is not valid after successfull sign-up operation..."
        );
        setError("Internal Server Error");
        return setLoading(false);
      }

      console.log("There is a valid auth object now.");
      console.log("We are switching initialProvider page now.");

      setLoading(false);

      return router.replace("/initialProvider");

      // Good to go...
    } catch (error) {
      console.error(
        "Error on fetching to route API from apidon-user side: ",
        error
      );
      setError("Internal Server Error");
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        gap: 20,
      }}
    >
      <View id="finish-header">
        <Text
          bold
          style={{
            fontSize: 32,
          }}
        >
          Set your account
        </Text>
      </View>

      <View id="username" style={{ gap: 10 }}>
        <Text bold>Username</Text>
        <TextInput
          style={[
            {
              width: "100%",
              height: 45,
              color: "white",
              backgroundColor: "black",
              borderWidth: 1,
              borderColor: "white",
              borderRadius: 10,
              padding: 10,
            },
            {
              borderColor:
                isUsernameValid || username.length === 0 ? "white" : "red",
            },
          ]}
          placeholder="Username"
          placeholderTextColor="#808080"
          autoCapitalize="none"
          keyboardType="default"
          value={username}
          onChangeText={handleUsernameChange}
          onSubmitEditing={() => {}}
        />
      </View>
      <View id="fullname" style={{ gap: 10 }}>
        <Text bold>Full Name</Text>
        <TextInput
          style={[
            {
              width: "100%",
              height: 45,
              color: "white",
              backgroundColor: "black",
              borderWidth: 1,
              borderColor: "white",
              borderRadius: 10,
              padding: 10,
            },
            {
              borderColor:
                isFullnameValid || fullname.length === 0 ? "white" : "red",
            },
          ]}
          placeholder="Full Name"
          placeholderTextColor="#808080"
          autoCapitalize="words"
          keyboardType="default"
          value={fullname}
          onChangeText={handleFullnameChange}
          onSubmitEditing={() => {}}
        />
      </View>

      {error.length > 0 && (
        <View
          id="error"
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "red",
            }}
          >
            {error}
          </Text>
        </View>
      )}

      <View
        style={{
          flex: 1,
          width: "100%",

          alignItems: "center",
        }}
      >
        <Pressable
          disabled={
            !isUsernameValid ||
            !isFullnameValid ||
            username.length === 0 ||
            fullname.length === 0
          }
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
              Continue
            </Text>
          )}
        </Pressable>
      </View>

      <View>
        <Button
          title="Sign Out"
          onPress={() => {
            auth().signOut();
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default additionalInfo;
