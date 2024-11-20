import Text from "@/components/Text/Text";
import UserContent from "@/components/User/UserContent";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { SafeAreaView, View } from "react-native";

const profile = () => {
  const { username } = useLocalSearchParams<{ username: string }>();

  if (!username) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            width: "100%",
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text>User not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return <UserContent username={username} key={username} />;
};

export default profile;
