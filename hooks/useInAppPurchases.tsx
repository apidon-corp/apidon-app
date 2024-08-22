import { useAuth } from "@/providers/AuthProvider";
import auth from "@react-native-firebase/auth";
import { useEffect, useState } from "react";
import Purchases, { PurchasesStoreProduct } from "react-native-purchases";

import crashlytics from "@react-native-firebase/crashlytics";

import firestore from "@react-native-firebase/firestore";
import { ConfigDocData } from "@/types/Plans";

const envTypeForIAP = process.env.EXPO_PUBLIC_ENVIRONMENT_TYPE_FOR_IAP || "";

let appStoreProductIds = [
  "1_dollar_in_app_credit",
  "5_dollar_in_app_credit",
  "10_dollar_in_app_credit",
  "25_dollar_in_app_credit",
  "50_dolar_in_app_credit",
  "100_dolar_in_app_credit",
  "250_dollar_in_app_credit",
  "500_dollar_in_app_credit",
  "1000_dollar_in_app_credit",
];

if (envTypeForIAP === "test") {
  let testEnvironmentAppStoreProcuductIds = appStoreProductIds.map(
    (productId) => `${productId}_test`
  );
  appStoreProductIds = testEnvironmentAppStoreProcuductIds;
}

export const useInAppPurchases = () => {
  const { authStatus } = useAuth();

  const [appStoreSubscriptionIds, setAppStoreSubscriptionIds] = useState<
    string[]
  >([]);

  const [products, setProducts] = useState<PurchasesStoreProduct[]>([]);
  const [subscriptions, setSubscriptions] = useState<PurchasesStoreProduct[]>(
    []
  );

  if (authStatus !== "authenticated") {
    console.log("User is not logged in to use in app purchases");
  }

  const currentUserDisplayName = auth().currentUser?.displayName;
  if (!currentUserDisplayName) {
    console.error("User display name is not defined to use in app purchases");
  }

  const appleAPIKey =
    process.env.EXPO_PUBLIC_REVENUE_CAT_IOS_IAP_PUBLIC_KEY || "";
  if (!appleAPIKey) {
    console.error("Apple API key is not defined to use in app purchases");
  }

  async function getSubscriptionProductIdS() {
    try {
      const configSnapshot = await firestore().doc(`plans/config`).get();

      if (!configSnapshot.exists) {
        console.error("plans/consif doc does not exist");
        crashlytics().recordError(new Error("plans/consif doc does not exist"));
        return setAppStoreSubscriptionIds([]);
      }

      const data = configSnapshot.data() as ConfigDocData;

      if (!data) {
        console.error("plans/consif doc data not exist");
        crashlytics().recordError(new Error("plans/consif doc data not exist"));
        return setAppStoreSubscriptionIds([]);
      }

      const activeSubscriptionProductIdS = data.activeSubscriptionProductIdS;

      setAppStoreSubscriptionIds(activeSubscriptionProductIdS);
    } catch (error) {
      console.error("Error on fetching subscription product ids:", error);
      crashlytics().recordError(
        new Error(`Error on fetching subscription product ids: ${error}`)
      );
      return setAppStoreSubscriptionIds([]);
    }
  }

  async function getProducts() {
    try {
      const productsFetched = await Purchases.getProducts(appStoreProductIds);
      const sortedProducts = productsFetched.sort((a, b) => a.price - b.price);

      if (!sortedProducts.length) throw new Error("No products found");

      return setProducts(sortedProducts);
    } catch (error) {
      console.error("Error on fetching products:", error);
      crashlytics().recordError(
        new Error(
          `Error on fetching top up products: ${error} Env Type for iap: ${envTypeForIAP} \n ProductIds On App: ${appStoreProductIds} \n Apple API Key: ${appleAPIKey} \n Display Name: ${currentUserDisplayName}`
        )
      );
      return setProducts([]);
    }
  }

  async function getSubscriptions() {
    if (!appStoreSubscriptionIds.length) return;

    try {
      const subscriptionsFetched = await Purchases.getProducts(
        appStoreSubscriptionIds
      );

      return setSubscriptions(subscriptionsFetched);
    } catch (error) {
      console.error("Error on fetching products:", error);
      crashlytics().recordError(
        new Error(
          `Error on fetching subscriptions: ${error} Env Type for iap: ${envTypeForIAP} \n Subscriptions On App: ${appStoreProductIds} \n Apple API Key: ${appleAPIKey} \n Display Name: ${currentUserDisplayName}`
        )
      );
      return setSubscriptions([]);
    }
  }

  // Getting productIds of subscription from database.
  // Rather than hardcoding it in the code, it is better to get it from the database.
  useEffect(() => {
    if (authStatus !== "authenticated") return;

    getSubscriptionProductIdS();
  }, [authStatus]);

  // Getting products from AppStore
  useEffect(() => {
    if (!currentUserDisplayName || !appleAPIKey) return;

    Purchases.configure({
      apiKey: appleAPIKey,
      appUserID: currentUserDisplayName,
    });

    getProducts();
    getSubscriptions();
  }, [currentUserDisplayName, appleAPIKey, appStoreSubscriptionIds]);

  return {
    products,
    subscriptions,
  };
};
