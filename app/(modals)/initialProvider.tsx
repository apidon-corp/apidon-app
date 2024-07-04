import OtherProvidersCard from "@/components/Provider/OtherProvidersCard";
import { handleGetActiveProviderStatus } from "@/helpers/Provider";

import { GetProviderInformationAPIResponseBody } from "@/types/Provider";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import { Text } from "@/components/Text/Text";
import { auth } from "@/firebase/client";

const initialProvider = () => {
  const [providerData, setProviderData] =
    useState<null | GetProviderInformationAPIResponseBody>(null);

  const [changingProvider, setChangingProvider] = useState(false);

  useEffect(() => {
    handleGetActiveProviderStatus().then((res) => {
      if (res) setProviderData(res);
    });
  }, []);

  useEffect(() => {
    if (changingProvider) return;

    setProviderData(null);
    handleGetActiveProviderStatus().then((res) => {
      if (res) setProviderData(res);
    });
  }, [changingProvider]);

  if (!providerData) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="white" size="large" />
      </View>
    );
  }

  if (providerData.isThereActiveProvider) {
    return <Redirect href="/home" />;
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1 }}
      contentContainerStyle={{
        gap: 20,
        padding: 10,
      }}
    >
      <View>
        <Text
          bold
          style={{
            fontSize: 12,
            color: "gray",
          }}
        >
          Choose from various community-created algorithms to personalize your
          Apidon feed. Change your algorithm anytime to keep your feed fresh and
          tailored to your interests. Explore and customize your experience!
        </Text>
      </View>
      <FlatList
        contentContainerStyle={{
          gap: 10,
        }}
        data={providerData.providerOptions}
        renderItem={({ item, index }) => (
          <OtherProvidersCard
            firstTimeChoosing
            initiallyOpen={index === 0}
            providerData={item}
            changingProvider={changingProvider}
            setChangingProvider={setChangingProvider}
          />
        )}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </ScrollView>
  );
};

export default initialProvider;
