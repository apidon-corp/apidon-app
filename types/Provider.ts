export type GetProviderInformationAPIResponseBody =
  | {
      isThereActiveProvider: false;
      providerOptions: IProviderShowcaseItem[];
    }
  | {
      providerOptions: IProviderShowcaseItem[];
      isThereActiveProvider: true;
      activeProviderInformation: ActiveProviderInformation;
    };

export type ActiveProviderInformation = {
  name: string;
  description: string;
  image: string;
  clientCount: number;
  score: number;
  userScore: number;
  offer: number;
  startTime: number;
};

export interface IProviderShowcaseItem {
  name: string;
  description: string;
  image: string;

  score: number;
  clientCount: number;

  offer: number;
}
