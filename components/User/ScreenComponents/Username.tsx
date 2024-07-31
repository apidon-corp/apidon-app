import UserContent from "@/components/User/UserContent";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  View,
} from "react-native";

import auth from "@react-native-firebase/auth";

const profile = () => {
  const { username } = useLocalSearchParams<{ username: string }>();

  const displayName = auth().currentUser?.displayName;

  const ownsPage = username === displayName;

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

                headerBackground: () =>
                  ownsPage ? (
                    <View style={{ flex: 1, backgroundColor: "black" }} />
                  ) : (
                    <></>
                  ),
              }}
            />
            <ScrollView
              style={{ flex: 1 }}
              keyboardShouldPersistTaps={"handled"}
              showsVerticalScrollIndicator={false}
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
