export type NFTMetadata = {
  description: string;
  external_url?: string;
  image?: string;
  name: string;
  attributes: (
    | {
        display_type: "date";
        trait_type: "Post Creation" | "NFT Creation";
        value: number;
      }
    | {
        trait_type: "Likes" | "Comments" | "Rating";
        value: number;
      }
    | {
        trait_type: "SENDER";
        value: string;
      }
  )[];
};

export const nftMetadataPlaceHolder: NFTMetadata = {
  description: "",
  name: "",
  attributes: [],
};

export type NftDocDataInServer = {
  mintTime: number;
  metadataLink: string;
  name: string;
  description: string;
  tokenId: number;
  contractAddress: string;
  openseaUrl: string;
  transferStatus: {
    isTransferred: boolean;
    transferredAddress?: string;
  };
  postDocPath: string;
  listStatus: {
    buyer?: string;
    buyers?: BuyersArrayObject[];
    currency?: "USD" | "TL";
    stock?: number;
    isListed: boolean;
    price?: number;
    sold?: boolean;
  };
};

export const NftDocDataInServerPlaceholder: NftDocDataInServer = {
  contractAddress: "",
  description: "",
  metadataLink: "",
  mintTime: 0,
  name: "",
  openseaUrl: "",
  postDocPath: "",
  tokenId: 0,
  transferStatus: {
    isTransferred: false,
  },
  listStatus: {
    isListed: false,
  },
};

export type BoughtNFTsArrayObject = {
  postDocPath: string;
  nftDocPath: string;
  ts: number;
};
export type SoldNFTsArrayObject = {
  postDocPath: string;
  nftDocPath: string;
  ts: number;
  username: string;
};

export type BuyersArrayObject = {
  username: string;
  ts: number;
};
