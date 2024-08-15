import { Stack } from "expo-router";
import React from "react";

const _layout = () => {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "black",
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="welcome"
        options={{
          headerTitle: "Welcome",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="emailPasswordSignUp"
        options={{
          headerTitle: "",
          headerBackTitle: "Welcome",
        }}
      />
      <Stack.Screen
        name="verifyEmail"
        options={{
          headerTitle: "",
          headerBackTitle: "Create Account",
        }}
      />
      <Stack.Screen
        name="additionalInfo"
        options={{
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="passwordDeleteAccount"
        options={{
          headerTitle: "",
          headerBackTitle: "Set Up Account",
        }}
      />
      <Stack.Screen
        name="emailPasswordSignIn"
        options={{
          headerBackTitle: "Welcome",
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="forgotPassword"
        options={{
          headerTitle: "",
          headerBackTitle: "Sign In",
        }}
      />
    </Stack>
  );
};

export default _layout;
