import { useAuth } from "@/providers/AuthProvider";
import { useState, useEffect } from "react";

import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { BalanceDocData } from "@/types/Wallet";

export const useBalance = () => {
  const {authStatus} = useAuth();

  const [balance, setBalance] = useState<"getting-balance" | number | "error">(
    "getting-balance"
  );

  useEffect(() => {
    if (authStatus !== "authenticated") return;

    const currentUserDisplayName = auth().currentUser?.displayName;
    if (!currentUserDisplayName) return;

    setBalance("getting-balance");

    const unsubscribe = firestore()
      .doc(`users/${currentUserDisplayName}/wallet/balance`)
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) {
            console.error("Balance document does not exist");
            return setBalance("error");
          }

          const balanceDocData = snapshot.data() as BalanceDocData;

          if (!balanceDocData) {
            console.error("Balance data is null");
            return setBalance("error");
          }

          setBalance(balanceDocData.balance);
        },
        (error) => {
          console.error("Error on fetching balance data: ", error);
          setBalance("error");
        }
      );

    return () => unsubscribe();
  }, [authStatus]);

  return {
    balance,
  };
};
