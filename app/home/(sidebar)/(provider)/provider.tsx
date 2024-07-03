import ActiveProviderCard from "@/components/Provider/ActiveProviderCard";
import OtherProvidersCard from "@/components/Provider/OtherProvidersCard";
import { handleGetActiveProviderStatus } from "@/providers/ProviderProvider";
import { GetProviderInformationAPIResponseBody } from "@/types/Provider";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, ScrollView, View } from "react-native";

const provider = () => {
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

  return (
    <ScrollView contentContainerStyle={{ flex: 1, gap: 20, paddingTop: 10 }}>
      {providerData.isThereActiveProvider && (
        <ActiveProviderCard
          changingProvider={changingProvider}
          activeProviderData={providerData.activeProviderInformation}
        />
      )}
      <FlatList
        contentContainerStyle={{
          gap: 10,
        }}
        data={providerData.providerOptions.filter((op) => {
          if (!providerData.isThereActiveProvider) return true;
          const activeProviderName =
            providerData.activeProviderInformation.name;
          return activeProviderName !== op.name;
        })}
        renderItem={({ item }) => (
          <OtherProvidersCard
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

export default provider;
