import Purchases, { PurchasesStoreProduct } from "react-native-purchases";
import auth from "@react-native-firebase/auth";
import { useEffect, useState } from "react";
import { ItemSKU, ProductQuickData } from "@/types/IAP";

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
  const currentUserDisplayName = auth().currentUser?.displayName;

  const [products, setProducts] = useState<PurchasesStoreProduct[]>([]);

  if (!currentUserDisplayName) {
    console.error("User is not logged in to use in app purchases");
  }

  const appleAPIKey =
    process.env.EXPO_PUBLIC_REVENUE_CAT_IOS_IAP_PUBLIC_KEY || "";
  if (!appleAPIKey) {
    console.error("Apple API key is not defined");
  }

  async function getProducts() {
    const productsFetched = await Purchases.getProducts(appStoreProductIds);

    const sortedProducts = productsFetched.sort((a, b) => a.price - b.price);

    setProducts(sortedProducts);
  }

  useEffect(() => {
    Purchases.configure({
      apiKey: appleAPIKey,
      appUserID: currentUserDisplayName,
    });

    getProducts();
  }, [currentUserDisplayName]);

  return {
    products,
  };
};
