import { ProductQuickData } from "@/types/Wallet";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import {
  endConnection,
  finishTransaction,
  getProducts,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
} from "react-native-iap";

const itemSKUs = Platform.select({
  ios: [
    "1_dollar_in_app_credit",
    "5_dollar_in_app_credit",
    "10_dollar_in_app_credit",
    "25_dollar_in_app_credit",
    "50_dolar_in_app_credit",
    "100_dolar_in_app_credit",
    "250_dollar_in_app_credit",
    "500_dollar_in_app_credit",
    "1000_dollar_in_app_credit",
  ],
});

const IapService = () => {
  const [products, setProducts] = useState<ProductQuickData[]>([]);

  useEffect(() => {
    const initializeIAP = async () => {
      try {
        const status = await initConnection();

        if (!status) {
          return console.log("Error initializing IAP");
        }

        // Fetching products...
        if (!itemSKUs)
          return console.error(
            "No products available, itemSKUs array is undefined"
          );

        const fetchedProducts = await getProducts({
          skus: itemSKUs,
        });

        fetchedProducts.sort((a, b) => Number(a.price) - Number(b.price));

        setProducts(
          fetchedProducts.map((f) => ({
            currency: f.currency as ProductQuickData["currency"],
            id: f.productId,
            price: f.price,
          }))
        );

        purchaseUpdatedListener(async (purchase) => {
          try {
            console.log("Purchase updated: ", purchase);
            await finishTransaction({ purchase, isConsumable: true });
          } catch (error) {
            console.log("Error finishing transaction: ", error);
          }
        });
        purchaseErrorListener((error) => {
          console.log("Error in purchase: ", error);
        });
      } catch (error) {
        return console.log("Error initializing IAP: ", error);
      }
    };
    initializeIAP();
    return () => {
      endConnection();
    };
  }, []);

  return {
    products,
  };
};

export default IapService;
