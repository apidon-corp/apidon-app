/**
 * @deprecated
 */
export type CollectibleTradeDocData = {
  createdCollectibles: CreatedCollectiblesArrayObject[];
  boughtCollectibles: BoughtCollectiblesArrayObject[];
  soldCollectibles: SoldCollectiblesArrayObject[];
};

/**
 * @deprecated
 */
export type CreatedCollectiblesArrayObject = {
  postDocPath: string;
  collectibleDocPath: string;
  ts: number;
};

export type CreatedCollectibleDocData = {
  postDocPath: string;
  collectibleDocPath: string;
  ts: number;
};

/**
 * @deprecated
 */
export type BoughtCollectiblesArrayObject = {
  postDocPath: string;
  collectibleDocPath: string;
  ts: number;
};

export type BoughtCollectibleDocData = {
  postDocPath: string;
  collectibleDocPath: string;
  ts: number;
};

/**
 * @deprecated
 */
export type SoldCollectiblesArrayObject = {
  postDocPath: string;
  collectibleDocPath: string;
  ts: number;
  username: string;
};

export type SoldCollectibleDocData = {
  postDocPath: string;
  collectibleDocPath: string;
  ts: number;
  username: string;
};

export type PaymentIntentDocData = {
  /**
   * The currency in which the payment is made, represented as a string (e.g., "USD", "EUR").
   */
  currency: string;

  /**
   * The unique identifier for the payment intent, used to track and reference the transaction.
   */
  id: string;

  /**
   * The document path to the post being purchased, indicating the location of the post within the database.
   */
  postDocPath: string;

  /**
   * The amount to be paid for the post, represented as a number.
   */
  price: number;

  /**
   * A boolean indicating whether the payment has been refunded (true if refunded, false otherwise).
   */
  refunded: boolean;

  /**
   * A boolean indicating whether the payment was successful (true if successful, false otherwise).
   */
  success: boolean;

  /**
   * The timestamp of when the payment intent was created, represented as a number (typically in milliseconds since epoch).
   */
  ts: number;

  /**
   * The username of the user making the payment, represented as a string.
   */
  username: string;
};

export type PaymentIntentDocDataUpdateable = {
  /**
   * The currency in which the payment is made, represented as a string (e.g., "USD", "EUR").
   */
  currency?: string;

  /**
   * The unique identifier for the payment intent, used to track and reference the transaction.
   */
  id?: string;

  /**
   * The document path to the post being purchased, indicating the location of the post within the database.
   */
  postDocPath?: string;

  /**
   * The amount to be paid for the post, represented as a number.
   */
  price?: number;

  /**
   * A boolean indicating whether the payment has been refunded (true if refunded, false otherwise).
   */
  refunded?: boolean;

  /**
   * A boolean indicating whether the payment was successful (true if successful, false otherwise).
   */
  success?: boolean;

  /**
   * The timestamp of when the payment intent was created, represented as a number (typically in milliseconds since epoch).
   */
  ts?: number;

  /**
   * The username of the user making the payment, represented as a string.
   */
  username?: string;
};
