export type ItemSKU =
  | "1_dollar_in_app_credit"
  | "5_dollar_in_app_credit"
  | "10_dollar_in_app_credit"
  | "25_dollar_in_app_credit"
  | "50_dolar_in_app_credit"
  | "100_dolar_in_app_credit"
  | "250_dollar_in_app_credit"
  | "500_dollar_in_app_credit"
  | "1000_dollar_in_app_credit";

export type ProductQuickData = {
  id: ItemSKU;
  price: string;
  currency: "USD" | "TL";
};
