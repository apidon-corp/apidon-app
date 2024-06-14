export type CheckThereIsLinkedAccountApiResponseBody = {
  email: string;
  username: string;
};

export type CheckReferralCodeApiResponseBody = {
  referralCodeStatus: "invalid" | "valid";
};
