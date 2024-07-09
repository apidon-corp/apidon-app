const userApisBaseUrl = process.env.EXPO_PUBLIC_USER_APIS_BASE_URL;

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
        checkReferralCode: `${userApisBaseUrl}/user-Authentication-signup-checkReferralCode`,
        sendVerificationCode: `${userApisBaseUrl}/user-Authentication-signup-sendVerificationCode`,
        signup: `${userApisBaseUrl}/user-Authentication-signup-signup`,
      },
    },
    notification: {
      updateLastOpenedTime: `${userApisBaseUrl}/user-Notification-updateLastOpenedTime`,
      updateNotificationToken: `${userApisBaseUrl}/user-Notification-updateNotificationToken`,
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
    uploadNFT: `${userApisBaseUrl}/nft-uploadNFT`
  }
};

export default apiRoutes;
