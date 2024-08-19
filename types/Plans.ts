import { PurchasesStoreProduct } from "react-native-purchases";

export type PlanCardData = {
  purchaseStoreProduct: PurchasesStoreProduct | null;
  title: "Free" | "Collector" | "Creator" | "Visionary";
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
  price: number;
};

export const freePlanCardData: PlanCardData = {
  purchaseStoreProduct: null,
  title: "Free",
  collectible: {
    undo: false,
    upToFive: true,
    upToTen: false,
    upToFifthy: false,
    upToHundred: false,
  },
  stock: {
    allowCollectingSoldOut: false,
    upToTen: true,
    upToFifty: false,
    upToHundred: false,
    upToThousand: false,
  },
  support: {
    priority: false,
  },
  price: 0,
};

export const collectorPlanCardData: PlanCardData = {
  purchaseStoreProduct: {} as PurchasesStoreProduct,
  title: "Collector",
  collectible: {
    undo: false,
    upToFive: true,
    upToTen: true,
    upToFifthy: false,
    upToHundred: false,
  },
  stock: {
    allowCollectingSoldOut: true,
    upToTen: true,
    upToFifty: true,
    upToHundred: false,
    upToThousand: false,
  },
  support: {
    priority: true,
  },
  price: 10,
};

export const creatorPlanCardData: PlanCardData = {
  purchaseStoreProduct: {} as PurchasesStoreProduct,
  title: "Creator",
  collectible: {
    undo: true,
    upToFive: true,
    upToTen: true,
    upToFifthy: true,
    upToHundred: false,
  },
  stock: {
    allowCollectingSoldOut: true,
    upToTen: true,
    upToFifty: true,
    upToHundred: true,
    upToThousand: false,
  },
  support: {
    priority: true,
  },
  price: 30,
};

export const visionaryPlanCardData: PlanCardData = {
  purchaseStoreProduct: {} as PurchasesStoreProduct,
  title: "Visionary",
  collectible: {
    undo: true,
    upToFive: true,
    upToTen: true,
    upToFifthy: true,
    upToHundred: true,
  },
  stock: {
    allowCollectingSoldOut: true,
    upToTen: true,
    upToFifty: true,
    upToHundred: true,
    upToThousand: true,
  },
  support: {
    priority: true,
  },
  price: 50,
};

export type SubscriptionIdentifiers =
  | "dev_apidon_collector_10_1m"
  | "dev_apidon_creator_10_1m"
  | "dev_apidon_visionary_10_1m";

export type BottomSheetModalData = {
  title: string;
  description: string;
};
