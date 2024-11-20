export type UserInServer = {
  username: string;
  fullname: string;
  profilePhoto: string;

  followingCount: number;
  followerCount: number;

  collectibleCount: number;

  email: string;
  uid: string;

  reportCount: number;

  /**
   * Indicated if user has purple thick.
   */
  verified: boolean;
  isScheduledToDelete: boolean;
};

export type FollowerDocData = {
  followTime: number;
};
