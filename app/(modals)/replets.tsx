import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import CreateReplet from "@/components/Frenlet/CreateReplet";
import Replet from "@/components/Frenlet/Replet";
import { Text } from "@/components/Text/Text";
import { FrenletServerData } from "@/types/Frenlet";
import { UserInServer } from "@/types/User";
import firestore from "@react-native-firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { Image } from "expo-image";
import { useAtomValue } from "jotai";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

const replets = () => {
  const screenParameters = useAtomValue(screenParametersAtom);
  const frenletDocPath = screenParameters.find(
    (query) => query.queryId === "frenletDocPath"
  )?.value as string;

  const [loading, setLoading] = useState(false);
  const [frenletData, setFrenletData] = useState<FrenletServerData | null>(
    null
  );

  const [senderData, setSenderData] = useState<UserInServer | null>(null);

  // Dynamic Data Fetching
  useEffect(() => {
    if (!frenletData) return;

    const unsubscribe = firestore()
      .doc(`users/${frenletData.frenletSender}`)
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) {
            console.error("User's realtime data can not be fecthed.");
            return setSenderData(null);
          }

          const userDocData = snapshot.data() as UserInServer;

          setSenderData(userDocData);
        },
        (error) => {
          console.error("Error on getting realtime data: ", error);
          return setSenderData(null);
        }
      );

    return () => unsubscribe();
  }, [frenletData]);

  useEffect(() => {
    if (!frenletDocPath) return;
    if (loading) return;

    setLoading(true);

    const unsubscribe = firestore()
      .doc(frenletDocPath)
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) {
            console.log("Frenlet's realtime data can not be fecthed.");
            return setLoading(false);
          }
          const frenletDocData = snapshot.data() as FrenletServerData;

          setFrenletData(frenletDocData);

          return setLoading(false);
        },
        (error) => {
          console.error("Error on getting realtime data: ", error);
          return setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [frenletDocPath]);

  if (!frenletData || loading || !senderData)
    return (
      <View style={{ flex: 1 }}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );

  return (
    <View
      style={{
        padding: 10,
        position: "relative",
        flex: 1,
      }}
    >
      <View id="recap" style={{ width: "100%", alignItems: "center", gap: 5 }}>
        <Image
          source={
            senderData.profilePhoto || require("@/assets/images/user.jpg")
          }
          transition={500}
          style={{ width: 80, height: 80, borderRadius: 40 }}
        />
        <Text bold>{senderData.username}</Text>
        <Text
          bold
          style={{
            fontSize: 18,
          }}
        >
          {frenletData.message}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: "gray",
          }}
        >
          {formatDistanceToNow(new Date(frenletData.ts))}
        </Text>
        <View
          style={{
            height: 1,
            backgroundColor: "rgba(255,255,255,0.2)",
            width: "100%",
            marginVertical: 10,
          }}
        />
      </View>
      <View id="replets">
        <FlatList
          contentContainerStyle={{
            gap: 20,
          }}
          keyExtractor={(item) => `${item.sender}-${item.ts}`}
          data={frenletData.replies.sort((b, a) => a.ts - b.ts)}
          renderItem={({ item }) => (
            <Replet
              frenletOwners={[
                frenletData.frenletReceiver,
                frenletData.frenletSender,
              ]}
              repletData={item}
              frenletDocPath={frenletDocPath}
              key={`${item.sender}-${frenletData.ts}`}
            />
          )}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>
      <View
        id="send-replet"
        style={{ position: "absolute", bottom: 20, left: 10, width: "100%" }}
      >
        <CreateReplet frenletDocPath={frenletDocPath} />
      </View>
    </View>
  );
};

export default replets;
