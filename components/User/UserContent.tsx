import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import { Text } from "@/components/Text/Text";
import { apidonPink } from "@/constants/Colors";
import { useAuth } from "@/providers/AuthProvider";
import {
  BoughtCollectibleDocData,
  CreatedCollectibleDocData,
} from "@/types/Trade";
import { UserInServer } from "@/types/User";
import firestore from "@react-native-firebase/firestore";
import { useAtom } from "jotai";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { FlatList, Switch } from "react-native-gesture-handler";
import Post from "../Post/Post";
import Header from "./Header";
import CollectibleContent from "./CollectibleContent";
import { Stack, router } from "expo-router";
import { Feather } from "@expo/vector-icons";

import auth from "@react-native-firebase/auth";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  username: string;
};

const UserContent = ({ username }: Props) => {
  const { bottom } = useSafeAreaInsets();

  const { authStatus } = useAuth();

  const [screenParameters, setScreenParameters] = useAtom(screenParametersAtom);
  const collectedNFTPostDocPath = screenParameters.find(
    (q) => q.queryId === "collectedNFTPostDocPath"
  )?.value as string;

  const [postDocPathArray, setPostDocPathArray] = useState<string[]>([]);
  const [collectibleData, setCollectibleData] = useState<{
    createdCollectibles: CreatedCollectibleDocData[];
    boughtCollectibles: BoughtCollectibleDocData[];
  }>({
    createdCollectibles: [],
    boughtCollectibles: [],
  });

  const [userData, setUserData] = useState<UserInServer | null | "not-found">(
    null
  );

  const [toggleValue, setToggleValue] = useState<"posts" | "nfts">("nfts");

  const scrollViewRef = useRef<ScrollView>(null);

  const onToggleValueChange = () => {
    setToggleValue((prev) => (prev === "posts" ? "nfts" : "posts"));
  };

  const { width } = Dimensions.get("screen");

  const [layoutReady, setLayoutReady] = useState(false);

  const [isOwnPage, setIsOwnPage] = useState(false);

  // Realtime Post Fetching
  useEffect(() => {
    if (authStatus !== "authenticated") return;
    if (!username) return;

    setPostDocPathArray([]);

    const unsubscribe = firestore()
      .collection(`users/${username}/posts`)
      .orderBy("creationTime", "desc")
      .onSnapshot(
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.doc.data().collectibleStatus.isCollectible) return;

            if (change.type === "added") {
              setPostDocPathArray((prev) => [change.doc.ref.path, ...prev]);
            } else if (change.type === "removed") {
              setPostDocPathArray((prev) =>
                prev.filter((path) => path !== change.doc.ref.path)
              );
            }
          });
        },
        (error) => {
          console.error("Error on getting realtime posts: ", error);
          return setPostDocPathArray([]);
        }
      );

    return () => unsubscribe();
  }, [username, authStatus]);

  // Realtime Created Collectible Fetching
  useEffect(() => {
    if (authStatus !== "authenticated") return;
    if (!username) return;

    const unsubscribe = firestore()
      .collection(`users/${username}/collectible/trade/createdCollectibles`)
      .orderBy("ts", "desc")
      .onSnapshot(
        (snapshot) => {
          setCollectibleData((prev) => ({
            ...prev,
            createdCollectibles: snapshot.docs.map(
              (doc) => doc.data() as CreatedCollectibleDocData
            ),
          }));
        },
        (error) => {
          console.error("Error on getting realtime data: ", error);
          return setCollectibleData((prev) => ({
            ...prev,
            createdCollectibles: [],
          }));
        }
      );

    return () => unsubscribe();
  }, [username, authStatus]);

  // Realtime Collected Collectible Fetching
  useEffect(() => {
    if (authStatus !== "authenticated") return;
    if (!username) return;

    const unsubscribe = firestore()
      .collection(`users/${username}/collectible/trade/boughtCollectibles`)
      .orderBy("ts", "desc")
      .onSnapshot(
        (snapshot) => {
          setCollectibleData((prev) => ({
            ...prev,
            boughtCollectibles: snapshot.docs.map(
              (doc) => doc.data() as BoughtCollectibleDocData
            ),
          }));
        },
        (error) => {
          console.error("Error on getting realtime data: ", error);
          return setCollectibleData((prev) => ({
            ...prev,
            boughtCollectibles: [],
          }));
        }
      );

    return () => unsubscribe();
  }, [username, authStatus]);

  // User Data Fetching
  useEffect(() => {
    if (authStatus !== "authenticated") return;
    if (!username) return;

    const unsubscribe = firestore()
      .doc(`users/${username}`)
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) {
            console.error("User is not found.");
            return setUserData("not-found");
          }

          const userDocData = snapshot.data() as UserInServer;

          setUserData(userDocData);
        },
        (error) => {
          console.error("Error on getting realtime data: ", error);
          return setUserData(null);
        }
      );

    return () => unsubscribe();
  }, [username, authStatus]);

  // Go to new collected element.
  useEffect(() => {
    if (!collectedNFTPostDocPath) return;

    if (!layoutReady) return;

    if (toggleValue !== "nfts") return setToggleValue("nfts");

    if (!scrollViewRef.current) {
      console.log("No Scroll View Ref");
      return;
    }

    const diff = 430 - width;
    const dest = 290 + diff;

    scrollViewRef.current.scrollTo({ x: 0, y: dest, animated: true });

    setScreenParameters([
      {
        queryId: "collectedNFTPostDocPath",
        value: undefined,
      },
    ]);
  }, [collectedNFTPostDocPath, layoutReady, toggleValue]);

  useEffect(() => {
    if (authStatus !== "authenticated") return setIsOwnPage(false);
    if (!userData || userData === "not-found") return setIsOwnPage(false);

    const displayName = auth().currentUser?.displayName || "";
    if (!displayName) return setIsOwnPage(false);

    const pageOwner = userData.username;

    setIsOwnPage(displayName === pageOwner);
  }, [authStatus, userData]);

  const handleOnLayout = () => {
    setLayoutReady(true);
  };

  const handlePressSettingsIcon = () => {
    router.push("/(modals)/settings");
  };

  if (!userData)
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color="white" />
      </View>
    );

  if (userData === "not-found") {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>User not found.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: `@${userData.username}`,
          headerRight: () => (
            <Pressable
              onPress={handlePressSettingsIcon}
              style={{ display: isOwnPage ? undefined : "none" }}
            >
              <Feather name="settings" size={21} color="white" />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        ref={scrollViewRef}
        keyboardShouldPersistTaps={"handled"}
        showsVerticalScrollIndicator={false}
        onLayout={handleOnLayout}
        contentContainerStyle={{
          paddingBottom: (bottom || 20) + 60,
        }}
      >
        <Header
          userData={userData}
          collsCount={
            collectibleData.createdCollectibles.length +
            collectibleData.boughtCollectibles.length
          }
        />

        <View
          id="toggle"
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 10,
            marginVertical: 15,
          }}
        >
          <Text
            bold
            style={{
              fontSize: 14,
            }}
          >
            Posts
          </Text>
          <Switch
            trackColor={{ false: apidonPink, true: apidonPink }}
            ios_backgroundColor={apidonPink}
            thumbColor="black"
            onValueChange={onToggleValueChange}
            value={toggleValue === "posts" ? false : true}
          />
          <Text
            bold
            style={{
              fontSize: 14,
            }}
          >
            Colls
          </Text>
        </View>

        {toggleValue === "posts" && (
          <FlatList
            contentContainerStyle={{
              gap: 20,
            }}
            keyExtractor={(item) => item}
            data={postDocPathArray}
            renderItem={({ item }) => <Post postDocPath={item} key={item} />}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        )}

        {toggleValue === "nfts" && (
          <>
            <CollectibleContent
              createdCollectibles={collectibleData.createdCollectibles}
              boughtCollectibles={collectibleData.boughtCollectibles}
            />
          </>
        )}
      </ScrollView>
    </>
  );
};

export default UserContent;
