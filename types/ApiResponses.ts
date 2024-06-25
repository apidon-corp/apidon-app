import { FrenletServerData } from "./Frenlet";

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

export type SignUpApiErrorResponseBody = {
  cause:
    | "server"
    | "email"
    | "password"
    | "username"
    | "fullname"
    | "verificationCode"
    | "referralCode";
  message: string;
};

export type FollowStatusAPIResponseBody = {
  doesRequesterFollowsSuspect: boolean;
  doesSuspectFollowsRequester: boolean;
};

export type GetPersonalizedUserFeedAPIResponseBody = {
  postDocPaths: string[];
  frenletDocPaths: string[];
};

export type CreateFrenletAPIResponseBody = {
  frenletDocPath: string;
};
