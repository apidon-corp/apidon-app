import ActiveProviderCard from "@/components/Provider/ActiveProviderCard";
import OtherProvidersCard from "@/components/Provider/OtherProvidersCard";
import { handleGetActiveProviderStatus } from "@/providers/ProviderProvider";
import { GetProviderInformationAPIResponseBody } from "@/types/Provider";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";

const provider = () => {
  const [providerData, setProviderData] =
    useState<null | GetProviderInformationAPIResponseBody>(null);

  useEffect(() => {
    handleGetActiveProviderStatus().then((res) => {
      if (res) setProviderData(res);
    });
  }, []);

  if (!providerData) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="white" size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, gap: 20, paddingTop: 10 }}>
      {providerData.isThereActiveProvider && (
        <ActiveProviderCard
          activeProviderData={providerData.providerData.additionalProviderData}
        />
      )}
      <FlatList
        contentContainerStyle={{
          gap: 10,
        }}
        data={providerData.providerOptions}
        renderItem={({ item }) => <OtherProvidersCard providerData={item} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default provider;
