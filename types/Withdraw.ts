export type WithdrawRequestDocData = {
  /** Unique identifier for each withdraw request */
  requestId: string;

  /** Username or user ID making the request */
  username: string;

  /** Amount requested for withdraw */
  requestedAmount: number;

  /** Currency of the withdraw */
  currency: string;

  /** Bank details required if the payment method is a bank transfer */
  bankDetails: {
    /** Name of the account holder for bank transfers */
    accountHolderName: string;

    /** Name of the bank */
    bankName: string;

    /** Bank account number */
    accountNumber: string;

    /** Bank routing number */
    routingNumber?: string;

    /** SWIFT/BIC code for international transfers (if applicable) */
    swiftCode: string;
  };

  /** Date and time when the withdraw request was made */
  requestedDate: string; // ISO 8601 format

  /** Current status of the withdraw request (e.g., pending, approved, rejected, processed) */
  status: "pending" | "approved" | "rejected" | "processed";

  /** Date and time when the withdraw was processed (if applicable) */
  processedDate: string; // ISO 8601 format

  /** Unique identifier for the transaction when the withdraw is processed (if applicable) */
  transactionId: string;

  /** Any additional notes or comments */
  notes: string;
};

export type WithdrawRequestInput = {
  /** Bank details required if the payment method is a bank transfer */
  bankDetails: {
    /** Name of the bank */
    bankName: string;

    /** Bank account number */
    accountNumber: string;

    /** SWIFT/BIC code for international transfers (if applicable) */
    swiftCode: string;

    /** Bank routing number */
    routingNumber?: string;
  };
};
