import { ItemSKU, ProductQuickData } from "@/types/IAP";

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

import appCheck from "@react-native-firebase/app-check";
import auth from "@react-native-firebase/auth";
import apiRoutes from "@/helpers/ApiRoutes";

const itemSKUs: ItemSKU[] =
  Platform.select({
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
  }) || [];

const IapService = () => {
  const [products, setProducts] = useState<ProductQuickData[]>([]);

  // App Initialization
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
            id: f.productId as ItemSKU,
            price: f.price,
          }))
        );
      } catch (error) {
        return console.log("Error initializing IAP: ", error);
      }
    };

    initializeIAP();
    return () => {
      endConnection();
    };
  }, []);

  // Purchase Handling
  useEffect(() => {
    const purchaseSubscriber = purchaseUpdatedListener(async (purchase) => {
      console.log("Purchase updated: ", purchase);

      try {
        if (!purchase.transactionId)
          return console.error("Transaction ID is undefined");

        const createPaymentIntentOnDatabaseResult =
          await createPaymentIntentOnDatabase(purchase.transactionId);

        if (!createPaymentIntentOnDatabaseResult)
          return console.error("Error creating payment intent on database");

        await finishTransaction({ purchase, isConsumable: true });
      } catch (error) {
        console.log("Error finishing transaction: ", error);
      }
    });

    return () => {
      purchaseSubscriber.remove();
    };
  }, []);

  // Error Handling
  useEffect(() => {
    const errorSubscriber = purchaseErrorListener((error) => {
      console.log("Error in purchase: ", error);
    });
    return () => {
      errorSubscriber.remove();
    };
  }, []);

  return {
    products,
  };
};

const createPaymentIntentOnDatabase = async (
  transactionId: string
): Promise<Boolean> => {
  const currentUserAuthObject = auth().currentUser;

  if (!currentUserAuthObject) {
    console.error("User not authenticated");
    return false;
  }

  try {
    const idToken = await currentUserAuthObject.getIdToken();
    const { token: appchecktoken } = await appCheck().getLimitedUseToken();

    const response = await fetch(apiRoutes.payment.createPayment, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${idToken}`,
        appchecktoken,
      },
      body: JSON.stringify({
        transactionId,
      }),
    });

    if (!response.ok) {
      console.error(
        "Response from createPayment API is not okay: \n",
        await response.text()
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error creating payment intent: (fetch) \n", error);
    return false;
  }
};

export default IapService;
