import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { useEffect, useRef, useState } from "react";

import firestore from "@react-native-firebase/firestore";
import { CollectedCollectibleDocData } from "@/types/Collectible";

const QUERY_LIMIT = 5;

type FirestoreDocType =
  FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>;

export function useMainCollectedCollectibles() {
  const isGettingDocs = useRef(false);
  const isGettingMainDocs = useRef(false);
  const lastDocRef = useRef<FirestoreDocType | undefined>(undefined);

  const noMoreColls = useRef(false);

  const [docs, setDocs] = useState<FirestoreDocType[]>([]);
  const [docDatas, setDocDatas] = useState<CollectedCollectibleDocData[]>([]);

  useEffect(() => {
    setDocDatas(docs.map((doc) => doc.data() as CollectedCollectibleDocData));
  }, [docs]);

  async function getDocs(startAfterDoc?: FirestoreDocType) {
    if (noMoreColls.current) {
      console.log("No more collected collectibles.");
      return false;
    }

    if (isGettingDocs.current) return false;
    isGettingDocs.current = true;

    try {
      let cCollectiblesQuery = firestore()
        .collection("collectedCollectibles")
        .orderBy("timestamp", "desc")
        .limit(QUERY_LIMIT);

      if (startAfterDoc) {
        cCollectiblesQuery = cCollectiblesQuery.startAfter(startAfterDoc);
      }

      const snapshot = await cCollectiblesQuery.get();

      noMoreColls.current = snapshot.docs.length != QUERY_LIMIT;

      isGettingDocs.current = false;
      lastDocRef.current =
        snapshot.docs.length > 0
          ? snapshot.docs[snapshot.docs.length - 1]
          : undefined;

      return snapshot.docs;
    } catch (error) {
      console.error("Error fetching collected collectibles:", error);

      // Ref Updates
      isGettingDocs.current = false;

      return false;
    }
  }

  async function getMainDocs() {
    if (isGettingMainDocs.current) return false;
    isGettingMainDocs.current = true;

    const newPostDocs = await getDocs(lastDocRef.current);
    if (!newPostDocs) {
      console.error(
        "Error on fetching new collected collectbiles. See other logs."
      );
      isGettingMainDocs.current = false;
      return false;
    }

    // State Update
    setDocs((prev) => [...prev, ...newPostDocs]);

    // Ref Update
    isGettingMainDocs.current = false;
  }

  async function refreshDocs() {
    lastDocRef.current = undefined;
    const newPostDocs = await getDocs(undefined);
    if (!newPostDocs) {
      console.error(
        "Error on fetching new collectible docs to refresh. See other logs."
      );
      return false;
    }

    setDocs(newPostDocs);
  }

  async function addNewlyCollectedItemToFeed(newCollectedDocPath: string) {
    try {
      const newCollectedDoc = (await firestore()
        .doc(newCollectedDocPath)
        .get()) as FirestoreDocType;
      if (!newCollectedDoc.exists) return false;

      setDocs((prev) => [newCollectedDoc, ...prev]);
      return true;
    } catch (error) {
      console.error("Error on adding newly collected item to feed: ", error);
      return false;
    }
  }

  return {
    docDatas,
    getMainDocs,
    isGettingMainDocs: isGettingMainDocs.current,
    refreshDocs,
    addNewlyCollectedItemToFeed
  };
}
