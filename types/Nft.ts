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
    currency?: "dollar" | "matic";
    isListed: boolean;
    price?: number;
    sold?: boolean;
  };
};
