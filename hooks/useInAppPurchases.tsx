import { useAuth } from "@/providers/AuthProvider";
import auth from "@react-native-firebase/auth";
import { useEffect, useState } from "react";
import Purchases, { PurchasesStoreProduct } from "react-native-purchases";

const appStoreProductIds = [
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

export const useInAppPurchases = () => {
  const { authStatus } = useAuth();

  const [products, setProducts] = useState<PurchasesStoreProduct[]>([]);

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

  async function getProducts() {
    const productsFetched = await Purchases.getProducts(appStoreProductIds);

    const sortedProducts = productsFetched.sort((a, b) => a.price - b.price);

    setProducts(sortedProducts);
  }

  useEffect(() => {
    if (currentUserDisplayName && appleAPIKey)
      Purchases.configure({
        apiKey: appleAPIKey,
        appUserID: currentUserDisplayName,
      });

    getProducts();
  }, [currentUserDisplayName, appleAPIKey]);

  return {
    products,
  };
};
