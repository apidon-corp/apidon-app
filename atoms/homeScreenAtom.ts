import { atom } from "jotai";

type HomeScreenParameter = {
  isHomeButtonPressed: boolean;
};

export const homeScreeenParametersAtom = atom<HomeScreenParameter>({
  isHomeButtonPressed: false,
});
