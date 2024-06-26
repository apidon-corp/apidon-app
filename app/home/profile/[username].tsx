import UserContent from "@/components/User/UserContent";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, SafeAreaView, ScrollView } from "react-native";

const profile = () => {
  const { username } = useLocalSearchParams<{ username: string }>();

  return (
    <>
      <SafeAreaView
        style={{
          flex: 1,
        }}
      >
        {!username ? (
          <ActivityIndicator color="white" size="large" />
        ) : (
          <>
            <Stack.Screen
              options={{
                title: username,
              }}
            />
            <ScrollView
              style={{ flex: 1 }}
              keyboardShouldPersistTaps={"handled"}
            >
              <UserContent username={username} />
            </ScrollView>
          </>
        )}
      </SafeAreaView>
    </>
  );
};

export default profile;
