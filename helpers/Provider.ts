import auth from "@react-native-firebase/auth";
import { GetProviderInformationAPIResponseBody } from "@/types/Provider";
import apiRoutes from "./ApiRoutes";

import appCheck from "@react-native-firebase/app-check";

import { captureException } from "@sentry/react-native";

export const handleGetActiveProviderStatus = async () => {
  const currentUserAuthObject = auth().currentUser;
  if (!currentUserAuthObject) return false;

  try {
    const idToken = await currentUserAuthObject.getIdToken();
    const { token: appchecktoken } = await appCheck().getLimitedUseToken();
    const response = await fetch(apiRoutes.provider.getProviderInformation, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${idToken}`,
        appchecktoken,
      },
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(
        `Response from getProviderInformation API is not okay: \n ${message}`
      );
    }

    const result =
      (await response.json()) as GetProviderInformationAPIResponseBody;

    return result;
  } catch (error) {
    console.error("Error on getting provider information: ", error);
    captureException(`Error on getting provider information: \n${error}`);
    return false;
  }
};
