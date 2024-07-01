export type GetProviderInformationAPIResponseBody =
  | {
      isThereActiveProvider: false;
      providerOptions: IProviderShowcaseItem[];
    }
  | {
      providerOptions: IProviderShowcaseItem[];
      isThereActiveProvider: true;
      providerData: {
        dueDatePassed: boolean;
        withdrawn: boolean;
        additionalProviderData: {
          name: string;
          description: string;
          image: string;
          clientCount: number;
          score: number;
          userScore: number;
          yield: number;
          duration: {
            startTime: number;
            endTime: number;
          };
        };
      };
    };

export type ActiveProviderData = {
  name: string;
  description: string;
  image: string;
  clientCount: number;
  score: number;
  userScore: number;
  yield: number;
  duration: {
    startTime: number;
    endTime: number;
  };
};

export interface IProviderShowcaseItem {
  name: string;
  description: string;
  image: string;

  score: number;
  clientCount: number;

  offer: number;
}
