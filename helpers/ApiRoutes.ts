let apiEndpoint = process.env.EXPO_PUBLIC_API_ENDPOINT || "";

if (!apiEndpoint) {
  console.error("User APIs Base URL is undefined. (from .env file)");
}

const apiRoutes = {
  feed: {
    getPersonalizedFeed: `${apiEndpoint}/feed-getPersonalizedFeed`,
  },
  user: {
    personal: {
      fullnameUpdate: `${apiEndpoint}/user-Personal-fullnameUpdate`,
      updateProfileImage: `${apiEndpoint}/user-Personal-updateProfileImage`,
    },
    authentication: {
      login: {
        checkThereIsLinkedAccount: `${apiEndpoint}/user-Authentication-login-checkThereIsLinkedAccount`,
      },
      signup: {
        sendVerificationCode: `${apiEndpoint}/user-Authentication-signup-sendVerificationCode`,
        verifyEmail: `${apiEndpoint}/user-Authentication-signup-verifyEmail`,
        completeSignUp: `${apiEndpoint}/user-Authentication-signup-completeSignUp`,
      },
    },
    notification: {
      updateLastOpenedTime: `${apiEndpoint}/user-Notification-updateLastOpenedTime`,
      updateNotificationToken: `${apiEndpoint}/user-Notification-updateNotificationToken`,
    },
    social: {
      follow: `${apiEndpoint}/user-Social-follow`,
      getFollowStatus: `${apiEndpoint}/user-Social-getFollowStatus`,
    },
  },
  collectible: {
    createCollectible: `${apiEndpoint}/collectible-createCollectible`, // http://192.168.1.3:5001/apidon-dev/us-central1/collecitble-createCollectible
    buyCollectible: `${apiEndpoint}/collectible-buyCollectible`,
    eventBased: {
      createCollectible: `${apiEndpoint}/collectible-eventBased-createCollectible`,
      collectCollectible: `${apiEndpoint}/collectible-eventBased-collectCollectible`, // http://161.9.114.76:5001/apidon-dev/us-central1/collectible-eventBased-createCollectible
    },
  },
  nft: {
    uploadNFT: `${apiEndpoint}/nft-uploadNFT`,
    listNFT: `${apiEndpoint}/nft-listNFT`,
    buyNFT: `${apiEndpoint}/nft-buyNFT`,
  },
  post: {
    comment: {
      postComment: `${apiEndpoint}/post-postComment`,
      postCommentDelete: `${apiEndpoint}/post-postCommentDelete`,
    },
    postDelete: `${apiEndpoint}/post-postDelete`,
    rate: {
      postRate: `${apiEndpoint}/post-postRate`,
    },
    postUpload: `${apiEndpoint}/post-postUpload`,
  },
  payment: {
    createPayment: `${apiEndpoint}/payment-createPayment`,
  },
  identity: {
    createVerificationSession: `${apiEndpoint}/identity-createVerificationSession`,
  },
  withdraw: {
    requestWithdraw: `${apiEndpoint}/user-Wallet-requestWithdraw`,
  },
};

export default apiRoutes;
