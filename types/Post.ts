export type PostServerData = {
  senderUsername: string;

  description: string;
  image: string;

  rates:  RateData[];

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

export type RateData = {
  sender: string;
  rate: number;
  ts: number;
};
