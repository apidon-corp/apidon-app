import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { FrenletServerData } from "@/types/Frenlet";

import { Text } from "@/components/Text/Text";
import { Image } from "expo-image";
import { auth, firestore } from "@/firebase/client";
import { UserInServer } from "@/types/User";
import { doc, onSnapshot } from "firebase/firestore";
import Replet from "./Replet";
import { MaterialIcons } from "@expo/vector-icons";
import { apidonPink } from "@/constants/Colors";
import { useSetAtom } from "jotai";
import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import { router } from "expo-router";

type Props = {
  frenletDocPath: string;
};

const Frenlet = ({ frenletDocPath }: Props) => {
  const [loading, setLoading] = useState(false);
  const [frenletData, setFrenletData] = useState<FrenletServerData | null>(
    null
  );

  const [senderData, setSenderData] = useState<UserInServer | null>(null);

  const [canDelete, setCanDelete] = useState(false);
  const [frenletDeleteLoading, setFrenletDeleteLoading] = useState(false);

  const [frenletDeleted, setFrenletDeleted] = useState(false);
  const animatedScaleValue = useRef(new Animated.Value(1)).current;

  const setScreenParameters = useSetAtom(screenParametersAtom);

  useEffect(() => {
    if (!frenletDocPath) return;
    if (loading) return;

    const frenletDocRef = doc(firestore, frenletDocPath);

    setLoading(true);

    const unsubscribe = onSnapshot(
      frenletDocRef,
      (snapshot) => {
        if (!snapshot.exists()) {
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

  // Dynamic Data Fetching
  useEffect(() => {
    if (!frenletData) return;

    const userDocRef = doc(firestore, `/users/${frenletData.frenletSender}`);

    const unsubscribe = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (!snapshot.exists()) {
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
    if (frenletData) checkCanDelete();
  }, [frenletData]);

  const checkCanDelete = () => {
    if (!frenletData) return setCanDelete(false);

    const displayName = auth.currentUser?.displayName;
    if (!displayName) return setCanDelete(false);

    const owners = [frenletData.frenletSender, frenletData.frenletReceiver];

    setCanDelete(owners.includes(displayName));
  };

  const handleFrenletDeleteButton = () => {
    Alert.alert(
      "Delete Frenlet",
      "Are you sure you want to delete this frenlet?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: handleDeleteFrenlet,
        },
      ]
    );
  };

  const handleDeleteFrenlet = async () => {
    if (!frenletData) return;
    if (frenletDeleteLoading) return;

    const currentUserAuthObject = auth.currentUser;
    if (!currentUserAuthObject) return false;

    const userPanelBaseUrl = process.env.EXPO_PUBLIC_USER_PANEL_ROOT_URL;
    if (!userPanelBaseUrl) {
      console.error("User panel base url couldnt fetch from .env file");
      return false;
    }

    const route = `${userPanelBaseUrl}/api/frenlet/deleteFrenlet`;
    const frenletDocPath = `/users/${frenletData.frenletSender}/frenlets/frenlets/outgoing/${frenletData.frenletDocId}`;

    setFrenletDeleteLoading(true);

    try {
      const idToken = await currentUserAuthObject.getIdToken();

      const response = await fetch(route, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          frenletDocPath: frenletDocPath,
        }),
      });

      if (!response.ok) {
        console.error(
          "Response from deleteFrenlet API is not okay: ",
          await response.text()
        );
        return setFrenletDeleteLoading(false);
      }

      setFrenletDeleteLoading(false);

      // Animation
      Animated.timing(animatedScaleValue, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setFrenletDeleted(true);
      });
    } catch (error) {
      console.error("Error on deleting frenlet: ", error);
      setFrenletDeleteLoading(false);
    }
  };

  if (!senderData || !frenletData || loading) {
    return (
      <View
        style={{
          width: "100%",
          padding: 50,
        }}
      >
        <ActivityIndicator color="white" />
      </View>
    );
  }

  if (frenletDeleted) {
    return <></>;
  }

  return (
    <Animated.View
      style={{
        width: "100%",
        backgroundColor: "rgba(255,255,255,0.1)",
        flexDirection: "row",
        padding: 10,
        gap: 30,
        borderRadius: 10,
        transform: [
          {
            scale: animatedScaleValue,
          },
        ],
      }}
    >
      <View
        id="sender"
        style={{
          alignItems: "center",
          gap: 5,
        }}
      >
        <Image
          source={senderData.profilePhoto}
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
          }}
        />
        <Text bold style={{ fontSize: 12 }}>
          {senderData.username}
        </Text>
      </View>
      <View id="content" style={{ gap: 5, justifyContent: "center", flex: 1 }}>
        <Text
          bold
          style={{
            fontSize: 16,
          }}
        >
          "{frenletData.message}"
        </Text>
        <Pressable
          onPress={() => {
            setScreenParameters([
              { queryId: "frenletDocPath", value: frenletDocPath },
            ]);
            router.push("/(modals)/replets");
          }}
          style={{
            flexDirection: "row",
            gap: 5,
          }}
        >
          <Text
            bold
            style={{
              color: apidonPink,
            }}
          >
            {frenletData.replies.length}
          </Text>
          <Text
            style={{
              color: apidonPink,
            }}
          >
            Replets
          </Text>
        </Pressable>
      </View>
      {canDelete && (
        <Pressable
          onPress={handleFrenletDeleteButton}
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
          disabled={frenletDeleteLoading}
        >
          {frenletDeleteLoading ? (
            <ActivityIndicator color="red" />
          ) : (
            <MaterialIcons name="delete-outline" size={32} color="red" />
          )}
        </Pressable>
      )}
    </Animated.View>
  );
};

export default Frenlet;