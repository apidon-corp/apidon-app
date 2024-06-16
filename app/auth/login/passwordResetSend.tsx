import { router } from "expo-router";
import React from "react";
import { Image, Pressable, SafeAreaView, Text, View } from "react-native";

type Props = {};

const passwordResetSend = (props: Props) => {
  const handleLoginButton = () => {
    router.replace("/auth/login");
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <View
        style={{
          flex: 1,
          gap: 20,
          alignItems: "center",
          justifyContent: "center",
          padding: 15,
        }}
      >
        <Image
          source={require("@/assets/images/logo.png")}
          style={{
            height: "12%",
            aspectRatio: 1,
          }}
        />
        <Text
          style={{
            color: "white",
            fontSize: 25,
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Password Reset Link Sent
        </Text>
        <Text
          style={{
            color: "#718096",
            fontSize: 13,
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          A password reset link has been sent to your email address. Follow the
          instructions there to regain access.
        </Text>

        <Pressable
          style={{
            backgroundColor: "white",
            padding: 10,
            borderRadius: 10,
            width: "85%",
          }}
          onPress={handleLoginButton}
        >
          <Text
            style={{
              textAlign: "center",
              color: "black",
            }}
          >
            Log In
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default passwordResetSend;
