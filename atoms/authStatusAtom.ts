import { AuthStatus } from "@/types/AuthType";
import { atom } from "jotai";

export const authStatusAtom = atom<AuthStatus>("loading");
