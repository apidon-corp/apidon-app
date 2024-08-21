import { SubscriptionIdentifiers } from "./Plans";

export type SubscriptionDocData = {
  isActive: boolean;
  productId: SubscriptionIdentifiers;
  periodType: string;
  purchasedTs: number;
  expirationTs: number;
  store: string;
  environment: string;
  // Only On Cancel Events
  cancellationReason?: string;
  // Only on Expiration Events
  expirationReason?: string;
  price: number;
  currency: string;
  priceInPurchasedCurrency: number;
  transactionId: string;
  countryCode: string;
  offerCode: string;
  customerId: string;
  ts: number;
};

export const subscriptionIdS = [
  "dev_apidon_collector_10_1m",
  "dev_apidon_creator_10_1m",
  "dev_apidon_visionary_10_1m",
];

export type SubscriptionProductIds =
  | "dev_apidon_collector_10_1m"
  | "dev_apidon_creator_10_1m"
  | "dev_apidon_visionary_10_1m";