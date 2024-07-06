import { View, ActivityIndicator, Pressable, Alert } from "react-native";
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
  frenletDocPath: string;
};

const Replet = ({ repletData, frenletOwners, frenletDocPath }: Props) => {
  const [senderData, setSenderData] = useState<UserInServer | null>(null);

  const [canDelete, setCanDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const handleDeleteRepletButton = () => {
    Alert.alert(
      "Delete Replet",
      "Are you sure you want to delete this replet?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: deleteReplet,
        },
      ]
    );
  };

  const deleteReplet = async () => {
    if (deleteLoading) return;
    if (!canDelete) return;

    const currentUserAuthObject = auth.currentUser;
    if (!currentUserAuthObject) return console.error("User is not logged");

    const userPanelBaseUrl = process.env.EXPO_PUBLIC_USER_PANEL_ROOT_URL;
    if (!userPanelBaseUrl) {
      return console.error("User panel base url couldnt fetch from .env file");
    }
    setDeleteLoading(true);

    const route = `${userPanelBaseUrl}/api/frenlet/deleteReplet`;

    try {
      const idToken = await currentUserAuthObject.getIdToken();
      const response = await fetch(route, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          frenletDocPath: frenletDocPath,
          replet: repletData,
        }),
      });

      if (!response.ok) {
        setDeleteLoading(false);
        return console.error(
          "Response from deleteReplet API is not okay: ",
          await response.text()
        );
      }

      // Automatically deletes from UI.
      return setDeleteLoading(false);
    } catch (error) {
      setDeleteLoading(false);
      console.error("Error on deleting replet: ", error);
    }
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
        source={
          senderData.profilePhoto ||
          require("@/assets/images/user.jpg")
        }
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
        }}
        transition={500}
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
        <Pressable
          onPress={handleDeleteRepletButton}
          style={{
            justifyContent: "center",
          }}
        >
          {deleteLoading ? (
            <ActivityIndicator color="red" />
          ) : (
            <Ionicons name="backspace" size={20} color="red" />
          )}
        </Pressable>
      )}
    </View>
  );
};

export default Replet;
