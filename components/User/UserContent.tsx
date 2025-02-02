import { Text } from "@/components/Text/Text";
import { apidonPink } from "@/constants/Colors";
import { useAuth } from "@/providers/AuthProvider";
import {
  BoughtCollectibleDocData,
  CreatedCollectibleDocData,
} from "@/types/Trade";
import { UserInServer } from "@/types/User";
import { Feather } from "@expo/vector-icons";
import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { Stack, router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  NativeScrollEvent,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { FlatList, Switch } from "react-native-gesture-handler";
import Post from "../Post/Post";
import CollectibleContent from "./CollectibleContent";
import Header from "./Header";

import auth from "@react-native-firebase/auth";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import * as StoreReview from "expo-store-review";

type Props = {
  username: string;
};

const UserContent = ({ username }: Props) => {
  const { bottom } = useSafeAreaInsets();

  const { authStatus } = useAuth();

  const [userData, setUserData] = useState<UserInServer | null | "not-found">(
    null
  );

  const [toggleValue, setToggleValue] = useState<"posts" | "nfts">("nfts");

  const scrollViewRef = useRef<ScrollView>(null);

  const [isOwnPage, setIsOwnPage] = useState(false);

  const [postDocs, setPostDocs] = useState<
    FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>[]
  >([]);

  const [createdCollectibleDocs, setCreatedCollectibleDocs] = useState<
    FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>[]
  >([]);

  const [collectedCollectibleDocs, setCollectedCollectibleDocs] = useState<
    FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>[]
  >([]);

  const [refreshLoading, setRefreshLoading] = useState(false);

  type CollectibleContentType = "created" | "collected";

  const [collectibleContentTypeValue, setCollectibleContentTypeValue] =
    useState<CollectibleContentType>("collected");

  const [currentUserBlockedBySender, setCurrentUserBlockedBySender] = useState<
    null | boolean
  >(false);

  //Realtime Block Checking
  useEffect(() => {
    if (!username) return;

    const displayName = auth().currentUser?.displayName || "";
    if (!displayName) return;

    if (username === displayName) return setCurrentUserBlockedBySender(false);

    const unsubscribe = firestore()
      .doc(`users/${username}/blocks/${displayName}`)
      .onSnapshot(
        (snapshot) => {
          setCurrentUserBlockedBySender(snapshot.exists);
        },
        (error) => {
          console.error("Error on getting realtime data  ", error);
          setCurrentUserBlockedBySender(null);
        }
      );

    return () => unsubscribe();
  }, [username]);

  // Initial Fetchings
  useEffect(() => {
    if (toggleValue === "posts") getInitialPosts();
    else if (collectibleContentTypeValue === "collected") {
      getInitialCollectedCollectibles();
    } else if (collectibleContentTypeValue === "created") {
      getInitialCreatedCollectibles();
    }
  }, [username, toggleValue, collectibleContentTypeValue]);

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

  useEffect(() => {
    if (authStatus !== "authenticated") return setIsOwnPage(false);
    if (!userData || userData === "not-found") return setIsOwnPage(false);

    const displayName = auth().currentUser?.displayName || "";
    if (!displayName) return setIsOwnPage(false);

    const pageOwner = userData.username;

    setIsOwnPage(displayName === pageOwner);
  }, [authStatus, userData]);

  const onToggleValueChange = () => {
    setToggleValue((prev) => (prev === "posts" ? "nfts" : "posts"));
  };

  const handlePressSettingsIcon = () => {
    router.push("/(modals)/settings");
  };

  const getInitialPosts = async () => {
    if (!username) return;

    try {
      const query = await firestore()
        .collection(`posts`)
        .where("senderUsername", "==", username)
        .orderBy("timestamp", "desc")
        .where("collectibleStatus.isCollectible", "==", false)
        .limit(5)
        .get();

      setPostDocs(query.docs);
    } catch (error) {
      console.error("Error on getting initial posts: ", error);
      setPostDocs([]);
    }
  };

  const getMorePosts = async () => {
    if (!postDocs) return;
    if (!username) return;

    const lastDoc = postDocs[postDocs.length - 1];
    if (!lastDoc) return;

    try {
      const query = await firestore()
        .collection(`posts`)
        .where("senderUsername", "==", username)
        .orderBy("timestamp", "desc")
        .where("collectibleStatus.isCollectible", "==", false)
        .startAfter(lastDoc)
        .limit(5)
        .get();

      setPostDocs((prev) => [
        ...(prev as FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>[]),
        ...query.docs,
      ]);
    } catch (error) {
      console.error("Error on getting more posts: ", error);
    }
  };

  const deletePostDocPathFromArray = async (postDocPath: string) => {
    setPostDocs((prev) => {
      const newArray = prev.filter((q) => q.ref.path !== postDocPath);
      return newArray;
    });
  };

  const getInitialCreatedCollectibles = async () => {
    if (!username) return;

    try {
      const query = await firestore()
        .collection(`users/${username}/collectible/trade/createdCollectibles`)
        .orderBy("ts", "desc")
        .limit(5)
        .get();

      setCreatedCollectibleDocs(query.docs);
    } catch (error) {
      console.error("Error on getting initial created collectibles: ", error);
      setCreatedCollectibleDocs([]);
    }
  };

  const getMoreCreatedCollectibles = async () => {
    if (!username) return;
    if (!createdCollectibleDocs) return;

    const lastDoc = createdCollectibleDocs[createdCollectibleDocs.length - 1];
    if (!lastDoc) return;

    try {
      const query = await firestore()
        .collection(`users/${username}/collectible/trade/createdCollectibles`)
        .orderBy("ts", "desc")
        .startAfter(lastDoc)
        .limit(5)
        .get();

      setCreatedCollectibleDocs((prev) => [
        ...(prev as FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>[]),
        ...query.docs,
      ]);
    } catch (error) {
      console.error("Error on getting more created collectibles: ", error);
    }
  };

  const getInitialCollectedCollectibles = async () => {
    if (!username) return;

    try {
      const query = await firestore()
        .collection(`users/${username}/collectible/trade/boughtCollectibles`)
        .orderBy("ts", "desc")
        .limit(5)
        .get();

      setCollectedCollectibleDocs(query.docs);
    } catch (error) {
      console.error("Error on getting initial collected collectibles: ", error);
      setCollectedCollectibleDocs([]);
    }
  };

  const getMoreCollectedCollectibles = async () => {
    if (!username) return;
    if (!collectedCollectibleDocs) return;

    const lastDoc =
      collectedCollectibleDocs[collectedCollectibleDocs.length - 1];
    if (!lastDoc) return;

    try {
      const query = await firestore()
        .collection(`users/${username}/collectible/trade/boughtCollectibles`)
        .orderBy("ts", "desc")
        .startAfter(lastDoc)
        .limit(5)
        .get();

      setCollectedCollectibleDocs((prev) => [
        ...(prev as FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>[]),
        ...query.docs,
      ]);
    } catch (error) {
      console.error("Error on getting more collected collectibles: ", error);
    }
  };

  const askUserForRating = async () => {
    try {
      const isAvailable = await StoreReview.isAvailableAsync();

      if (!isAvailable) {
        return console.error("Store review is not available on this device.");
      }

      await StoreReview.requestReview();
    } catch (error) {
      console.error("Error on asking user for rating: ", error);
    }
  };

  const handleScroll = (event: NativeScrollEvent) => {
    const threshold = 250;

    const { layoutMeasurement, contentOffset, contentSize } = event;

    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - threshold;
    if (isCloseToBottom) {
      if (toggleValue === "posts") getMorePosts();
      else if (collectibleContentTypeValue === "created") {
        getMoreCreatedCollectibles();
      } else if (collectibleContentTypeValue === "collected") {
        getMoreCollectedCollectibles();
      }
    }
  };

  async function handleRefresh() {
    if (refreshLoading) return;

    setRefreshLoading(true);

    if (toggleValue === "posts") await getInitialPosts();
    else if (collectibleContentTypeValue === "created") {
      await getInitialCreatedCollectibles();
    } else if (collectibleContentTypeValue === "collected") {
      await getInitialCollectedCollectibles();
    }

    setRefreshLoading(false);
  }

  if (!userData || currentUserBlockedBySender === null)
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

  if (
    userData === "not-found" ||
    currentUserBlockedBySender ||
    userData.isScheduledToDelete
  ) {
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
        contentContainerStyle={{
          paddingBottom: (bottom || 20) + 60,
        }}
        onScroll={({ nativeEvent }) => handleScroll(nativeEvent)}
        scrollEventThrottle={500}
        refreshControl={
          <RefreshControl
            refreshing={refreshLoading}
            onRefresh={handleRefresh}
          />
        }
      >
        <Header userData={userData} collsCount={userData.collectibleCount} />

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
            thumbColor={Platform.OS === "ios" ? "black" : "gray"}
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
            data={postDocs.map((p) => {
              return p.ref.path;
            })}
            renderItem={({ item }) => (
              <Post
                postDocPath={item}
                key={item}
                deletePostDocPathFromArray={deletePostDocPathFromArray}
              />
            )}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        )}

        {toggleValue === "nfts" && (
          <CollectibleContent
            collectibleContentTypeValue={collectibleContentTypeValue}
            setCollectibleContentTypeValue={setCollectibleContentTypeValue}
            createdCollectibles={createdCollectibleDocs.map(
              (c) => c.data() as CreatedCollectibleDocData
            )}
            boughtCollectibles={collectedCollectibleDocs.map(
              (c) => c.data() as BoughtCollectibleDocData
            )}
          />
        )}
      </ScrollView>
    </>
  );
};

export default UserContent;
