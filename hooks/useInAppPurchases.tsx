import { useAuth } from "@/providers/AuthProvider";
import auth from "@react-native-firebase/auth";
import { useEffect, useState } from "react";
import Purchases, { PurchasesStoreProduct } from "react-native-purchases";
import crashlytics from "@react-native-firebase/crashlytics";
import firestore from "@react-native-firebase/firestore";
import { ConfigDocData } from "@/types/Plans";
import { TopUpPlansConfigDocData } from "@/types/IAP";

export const useInAppPurchases = () => {
  const { authStatus } = useAuth();

  const [appStoreTopUpProductIdS, setAppStoreTopUpProductIdS] = useState<
    string[]
  >([]);
  const [products, setProducts] = useState<PurchasesStoreProduct[]>([]);

  const [appStoreSubscriptionIds, setAppStoreSubscriptionIds] = useState<
    string[]
  >([]);
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

  async function getTopUpProductIdS() {
    try {
      const configDocSnapshot = await firestore()
        .doc("topUpPlans/config")
        .get();

      if (!configDocSnapshot.exists) {
        console.error("topUpPlans/config doc does not exist");
        crashlytics().recordError(
          new Error("topUpPlans/config doc does not exist")
        );
        return setAppStoreTopUpProductIdS([]);
      }

      const data = configDocSnapshot.data() as TopUpPlansConfigDocData;

      if (!data) {
        console.error("topUpPlans/config doc data does not exist");
        crashlytics().recordError(
          new Error("topUpPlans/config doc data does not exist")
        );
        return setAppStoreTopUpProductIdS([]);
      }

      const activeTopUpProductIdS = data.activeTopUpProductIdS;

      setAppStoreTopUpProductIdS(activeTopUpProductIdS);
    } catch (error) {
      console.error("Error on fetching top up product ids:", error);
      crashlytics().recordError(
        new Error(`Error on fetching top up product ids: ${error}`)
      );
      return setAppStoreTopUpProductIdS([]);
    }
  }

  async function getProducts() {
    if (!appStoreTopUpProductIdS.length) return;

    try {
      const productsFetched = await Purchases.getProducts(
        appStoreTopUpProductIdS
      );
      const sortedProducts = productsFetched.sort((a, b) => a.price - b.price);

      if (!sortedProducts.length) throw new Error("No products found");

      return setProducts(sortedProducts);
    } catch (error) {
      console.error("Error on fetching products:", error);
      crashlytics().recordError(
        new Error(
          `Error on fetching top up products: ${error} \n ProductIds On App: ${appStoreTopUpProductIdS} \n Apple API Key: ${appleAPIKey} \n Display Name: ${currentUserDisplayName}`
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
          `Error on fetching subscriptions: ${error} \n Subscriptions On App: ${appStoreTopUpProductIdS} \n Apple API Key: ${appleAPIKey} \n Display Name: ${currentUserDisplayName}`
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
    getTopUpProductIdS();
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
  }, [
    currentUserDisplayName,
    appleAPIKey,
    appStoreSubscriptionIds,
    appStoreTopUpProductIdS,
  ]);

  return {
    products,
    subscriptions,
  };
};
