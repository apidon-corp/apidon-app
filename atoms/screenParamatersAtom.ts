import { atom } from "jotai";

interface ScreenParameter {
  queryId: string;
  value: any;
}

export const screenParametersAtom = atom<ScreenParameter[]>([]);
