export type CheckThereIsLinkedAccountApiResponseBody = {
  email: string;
  username: string;
};

export type CheckReferralCodeApiResponseBody = {
  referralCodeStatus: "invalid" | "valid";
};

export type VerificationCodeSendApiErrorResponseBody = {
  cause:
    | "server"
    | "email"
    | "password"
    | "username"
    | "fullname"
    | "referralCode";
  message: string;
};
