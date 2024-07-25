const userApisBaseUrl = process.env.EXPO_PUBLIC_USER_APIS_BASE_URL;
const userApisPreviewBaseUrl =
  process.env.EXPO_PUBLIC_USER_APIS_PREVIEW_BASE_URL;

if (!userApisBaseUrl)
  console.error("User APIs Base URL is undefined. (from .env file)");

if (!userApisPreviewBaseUrl)
  console.error("User APIs Preview Base URL is undefined. (from .env file)");

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
        checkReferralCode: `${userApisBaseUrl}/user-Authentication-signup-checkReferralCode`,
        sendVerificationCode: `${userApisBaseUrl}/user-Authentication-signup-sendVerificationCode`,
        signup: `${userApisBaseUrl}/user-Authentication-signup-signup`,
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
  frenlet: {
    createFrenlet: `${userApisBaseUrl}/frenlet-createFrenlet`,
    createTag: `${userApisBaseUrl}/frenlet-createTag`,
    deleteFrenlet: `${userApisBaseUrl}/frenlet-deleteFrenlet`,
    deleteReplet: `${userApisBaseUrl}/frenlet-deleteReplet`,
    getFrenOptions: `${userApisBaseUrl}/frenlet-getFrenOptions`,
    sendReply: `${userApisBaseUrl}/frenlet-sendReply`,
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
