type Environment = "development" | "preview" | "production";

const environment =
  (process.env.EXPO_PUBLIC_ENVIRONMENT_KEY as Environment) || "development";

let userApisBaseUrl = "";

if (environment === "development")
  userApisBaseUrl = process.env.EXPO_PUBLIC_USER_APIS_BASE_URL || "";

if (environment === "preview")
  userApisBaseUrl = process.env.EXPO_PUBLIC_USER_APIS_PREVIEW_BASE_URL || "";

if (!userApisBaseUrl)
  console.error("User APIs Base URL is undefined. (from .env file)");

const apiRoutes = {
  feed: {
    getPersonalizedFeed: `${userApisBaseUrl}/feed-getPersonalizedFeed`,
  },
  user: {
    personal: {
      fullnameUpdate: `${userApisBaseUrl}/user-Personal-fullnameUpdate`,
      updateProfileImage: `${userApisBaseUrl}/user-Personal-updateProfileImage`,
    },
    authentication: {
      login: {
        checkThereIsLinkedAccount: `${userApisBaseUrl}/user-Authentication-login-checkThereIsLinkedAccount`,
      },
      signup: {
        sendVerificationCode: `${userApisBaseUrl}/user-Authentication-signup-sendVerificationCode`,
        verifyEmail: `${userApisBaseUrl}/user-Authentication-signup-verifyEmail`,
        completeSignUp: `${userApisBaseUrl}/user-Authentication-signup-completeSignUp`,
      },
    },
    notification: {
      updateLastOpenedTime: `${userApisBaseUrl}/user-Notification-updateLastOpenedTime`,
      updateNotificationToken: `${userApisBaseUrl}/user-Notification-updateNotificationToken`,
    },
    social: {
      follow: `${userApisBaseUrl}/user-Social-follow`,
      getFollowStatus: `${userApisBaseUrl}/user-Social-getFollowStatus`,
    },
  },
  nft: {
    uploadNFT: `${userApisBaseUrl}/nft-uploadNFT`,
    listNFT: `${userApisBaseUrl}/nft-listNFT`,
    buyNFT: `${userApisBaseUrl}/nft-buyNFT`,
  },
  post: {
    comment: {
      postComment: `${userApisBaseUrl}/post-postComment`,
      postCommentDelete: `${userApisBaseUrl}/post-postCommentDelete`,
    },
    postDelete: `${userApisBaseUrl}/post-postDelete`,
    rate: {
      postRate: `${userApisBaseUrl}/post-postRate`,
    },
    postUpload: `${userApisBaseUrl}/post-postUpload`,
  },
  provider: {
    getProviderInformation: `${userApisBaseUrl}/provider-getProviderInformation`,
    rateProvider: `${userApisBaseUrl}/provider-rateProvider`,
    selectProvider: `${userApisBaseUrl}/provider-selectProvider`,
  },
  payment: {
    createPayment: `${userApisBaseUrl}/payment-createPayment`,
  },
};

export default apiRoutes;
