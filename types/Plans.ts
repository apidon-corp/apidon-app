export type PlanCardData = {
  title: string;
  canCollectSoldOutItems: boolean;
  collectibleLimit: number | "Unlimited";
  stockLimit: number | "Unlimited";
  price: number | "free";
};

export type BubbleId = "collect-sold-out" | "collectible-limit" | "stock-limit";
