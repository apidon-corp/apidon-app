export type PostServerData = {
  senderUsername: string;

  description: string;
  image: string;

  rates: RateData[];
  comments: CommentServerData[];

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
