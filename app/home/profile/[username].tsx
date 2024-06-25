import Header from "@/components/User/Header";
import UserContent from "@/components/User/UserContent";
import { useLocalSearchParams } from "expo-router";
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
          <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps={"handled"}>
            <Header username={username} />
            <UserContent username={username} />
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
};

export default profile;
