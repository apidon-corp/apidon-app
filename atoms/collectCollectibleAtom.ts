import { atom } from "jotai";

export interface CollectCollectibleInterface {
  code: string;
}

export const collectCollectibleAtom = atom<CollectCollectibleInterface>();
