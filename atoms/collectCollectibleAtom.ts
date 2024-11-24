import { atom } from "jotai";

interface CollectCollectibleInterface {
  code: string;
}

export const collectCollectibleAtom = atom<CollectCollectibleInterface>();
