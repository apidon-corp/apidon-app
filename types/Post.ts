export type PostServerData = {
  senderUsername: string;

  description: string;
  image: string;

  ratingCount: number;
  ratingSum: number;

  commentCount: number;

  collectibleStatus:
    | {
        isCollectible: false;
      }
    | {
        isCollectible: true;
        collectibleDocPath: string;
      };

  creationTime: number;
  id: string;

  reviewStatus: ReviewStatus;
};

export type RatingData = {
  sender: string;
  rating: number;
  timestamp: number;
};

export type CommentServerData = {
  sender: string;
  message: string;
  ts: number;
};

export type ReviewStatus =
  /**
   * Indicates that the review is currently pending and has not yet been reviewed.
   * It is awaiting approval or rejection.
   */
  | "pending"

  /**
   * Indicates that the review has been reviewed and approved.
   * No further action is required.
   */
  | "approved"

  /**
   * Represents a rejected review, including a reason for the rejection.
   * The `rejectionReason` provides additional context for why the review was not approved.
   */
  | {
      status: "rejected";
      rejectionReason: string;
    };

export type PostDataOnMainPostsCollection = {
  postDocPath: string;
  sender: string;
  timestamp: number;
};

export type ReportDocData = {
  ts: number;
  username: string;
};
