import { auth } from "@/firebase/client";
import { GetProviderInformationAPIResponseBody } from "@/types/Provider";

export const handleGetActiveProviderStatus = async () => {
  const currentUserAuthObject = auth.currentUser;
  if (!currentUserAuthObject) return false;

  const userPanelBaseUrl = process.env.EXPO_PUBLIC_USER_PANEL_ROOT_URL;
  if (!userPanelBaseUrl) {
    console.error("User panel base url couldnt fetch from .env file");
    return false;
  }

  const route = `${userPanelBaseUrl}/api/provider/getProviderInformation`;

  try {
    const idToken = await currentUserAuthObject.getIdToken();
    const response = await fetch(route, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      const message = await response.text();
      console.error(
        "Response from getProviderInformation API is not okay: ",
        message
      );
      return false;
    }

    const result =
      (await response.json()) as GetProviderInformationAPIResponseBody;

    return result;
  } catch (error) {
    console.error("Error on getting provider information: ", error);
    return false;
  }
};
