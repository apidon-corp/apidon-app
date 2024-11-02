import DeleteAccount from "@/components/Settings/DeleteAccount";
import GetPinkTick from "@/components/Settings/GetPinkTick";
import IdentitySettings from "@/components/Settings/IdentitySettings";
import NotificationSettings from "@/components/Settings/NotificationSettings";
import SignOut from "@/components/User/SignOut";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import auth from "@react-native-firebase/auth";

const settings = () => {
  const [isSignedWithApple, setSignedWithApple] = useState(false);

  useEffect(() => {
    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return setSignedWithApple(false);

    const providerData = currentUserAuthObject.providerData;
    const providerId = providerData[0].providerId;

    const isApple = providerId === "apple.com";

    return setSignedWithApple(isApple);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        alignItems: "center",
        padding: 10,
        gap: 10,
      }}
    >
      <NotificationSettings />
      <IdentitySettings />
      <GetPinkTick />
      <SignOut />

      {isSignedWithApple && (
        <>
          <View
            style={{
              height: 1,
              backgroundColor: "gray",
              width: "85%",
              marginVertical: 20,
            }}
          />
          <DeleteAccount />
        </>
      )}
    </View>
  );
};

export default settings;
