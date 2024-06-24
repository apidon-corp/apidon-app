import { View, ActivityIndicator } from "react-native";
import { Text } from "@/components/Text/Text";
import React, { useEffect, useState } from "react";
import { RepletServerData } from "@/types/Frenlet";
import { UserInServer } from "@/types/User";
import { auth, firestore } from "@/firebase/client";
import { doc, onSnapshot } from "firebase/firestore";
import { Image } from "expo-image";
import { formatDistanceToNow } from "date-fns";
import { Entypo, Ionicons } from "@expo/vector-icons";

type Props = {
  repletData: RepletServerData;
  frenletOwners: string[];
};

const Replet = ({ repletData, frenletOwners }: Props) => {
  const [senderData, setSenderData] = useState<UserInServer | null>(null);

  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    if (!repletData) return;

    const userDocRef = doc(firestore, `/users/${repletData.sender}`);

    const unsubscribe = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          console.error("User's realtime data can not be fecthed.");
          return setSenderData(null);
        }

        const userData = snapshot.data() as UserInServer;
        setSenderData(userData);
      },
      (error) => {
        console.error(error);
        setSenderData(null);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [repletData.sender]);

  useEffect(() => {
    checkCanDelete();
  }, [auth, repletData, frenletOwners]);

  const checkCanDelete = () => {
    const displayName = auth.currentUser?.displayName;
    if (!displayName) return setCanDelete(false);

    const repletOwners = [repletData.sender, ...frenletOwners];

    setCanDelete(repletOwners.includes(displayName));
  };

  if (!repletData || !senderData) {
    return (
      <View
        style={{
          padding: 50,
        }}
      >
        <ActivityIndicator color="white" />
      </View>
    );
  }

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 10,
      }}
    >
      <Image
        source={senderData.profilePhoto}
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
        }}
      />
      <View
        style={{
          flexGrow: 1,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text
            bold
            style={{
              fontSize: 12,
              color: "gray",
            }}
          >
            {senderData.username}
          </Text>
          <Entypo name="dot-single" size={24} color="gray" />
          <Text
            style={{
              fontSize: 10,
              color: "gray",
            }}
          >
            {formatDistanceToNow(new Date(repletData.ts))}
          </Text>
        </View>

        <Text bold>{repletData.message}</Text>
      </View>

      {canDelete && (
        <View>
          <Ionicons name="backspace" size={20} color="red" />
        </View>
      )}
    </View>
  );
};

export default Replet;
