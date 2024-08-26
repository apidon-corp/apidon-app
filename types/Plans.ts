import { PurchasesStoreProduct } from "react-native-purchases";

/**
 * Plan Data that stored on Database.
 */
export interface PlanDocData {
  storeProductId: string;
  title: string;
  collectible: {
    upToFive: boolean;
    upToTen: boolean;
    upToFifthy: boolean;
    upToHundred: boolean;
  };
  stock: {
    upToTen: boolean;
    upToFifty: boolean;
    upToHundred: boolean;
    upToThousand: boolean;
  };
  support: {
    priority: boolean;
  };
  price: {
    price: number;
    currency: string;
  };
}

/**
 * Plan data for showing to user.
 */
export interface PlanCardData extends PlanDocData {
  purchaseStoreProduct: PurchasesStoreProduct | null;
}

export type BottomSheetModalData = {
  title: string;
  description: string;
};

export type ConfigDocData = {
  activeSubscriptionProductIdS: string[];
};

export function calculateStockLimit(stockData: PlanCardData["stock"]) {
  let stockLimit = 0;

  if (stockData.upToTen) stockLimit = 10;
  if (stockData.upToFifty) stockLimit = 50;
  if (stockData.upToHundred) stockLimit = 100;
  if (stockData.upToThousand) stockLimit = 1000;

  return stockLimit;
}
