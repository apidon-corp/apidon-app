export type PostServerData = {
  senderUsername: string;

  description: string;
  image: string;

  likeCount: number;
  likes: LikeServerData[];

  commentCount: number;
  comments: CommentServerData[];

  nftStatus: {
    convertedToNft: boolean;
    nftDocPath?: string;
  };

  creationTime: number;
  id: string;
};

export type CommentServerData = {
  sender: string;
  message: string;
  ts: number;
};

export type LikeServerData = {
  sender: string;
  ts: number;
};
