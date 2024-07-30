import UserContent from "@/components/User/UserContent";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  ScrollView,
} from "react-native";
import crashlytics from "@react-native-firebase/crashlytics";

const profile = () => {
  const { username } = useLocalSearchParams<{ username: string }>();

  return (
    <>
      <SafeAreaView
        style={{
          flex: 1,
        }}
      >
        <Button
          title="Crash"
          onPress={() => {
            crashlytics().crash();
          }}
        />
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
