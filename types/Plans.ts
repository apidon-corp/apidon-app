import { PurchasesStoreProduct } from "react-native-purchases";

/**
 * Plan Data that stored on Database.
 */
export interface PlanDocData {
  storeProductId: string;
  title: string;
  collectible: {
    undo: boolean;
    upToFive: boolean;
    upToTen: boolean;
    upToFifthy: boolean;
    upToHundred: boolean;
  };
  stock: {
    allowCollectingSoldOut: boolean;
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
