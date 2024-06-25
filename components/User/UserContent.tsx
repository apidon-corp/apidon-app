import { apidonPink } from "@/constants/Colors";
import { firestore } from "@/firebase/client";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, View } from "react-native";
import { FlatList, Switch } from "react-native-gesture-handler";
import Post from "../Post/Post";

import { Text } from "@/components/Text/Text";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import CreateFrenlet from "../Frenlet/CreateFrenlet";
import Frenlet from "../Frenlet/Frenlet";
import Header from "./Header";
import { UserInServer } from "@/types/User";

type Props = {
  username: string;
};

const UserContent = ({ username }: Props) => {
  const [postDocPathArray, setPostDocPathArray] = useState<string[]>([]);
  const [frenletDocPaths, setFrenletDocPaths] = useState<string[]>([]);
  const [userData, setUserData] = useState<UserInServer | null>(null);

  const [toggleValue, setToggleValue] = useState<"posts" | "frenlets">("posts");

  const { height } = Dimensions.get("window");

  const onToggleValueChange = () => {
    setToggleValue((prev) => (prev === "posts" ? "frenlets" : "posts"));
  };

  // Post Fetching
  useEffect(() => {
    if (!username) return;

    setPostDocPathArray([]);

    const postsCollectionRef = collection(
      firestore,
      `/users/${username}/posts`
    );
    const postsQuery = query(
      postsCollectionRef,
      orderBy("creationTime", "desc")
    );

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          setPostDocPathArray((prev) => [change.doc.ref.path, ...prev]);
        } else if (change.type === "removed") {
          setPostDocPathArray((prev) =>
            prev.filter((path) => path !== change.doc.ref.path)
          );
        }
      });
    });

    return () => unsubscribe();
  }, [username]);

  // Frenlet Fetching
  useEffect(() => {
    if (!username) return;

    setFrenletDocPaths([]);

    const frenletsCollectionRef = collection(
      firestore,
      `/users/${username}/frenlets/frenlets/incoming`
    );
    const frenletsQuery = query(frenletsCollectionRef, orderBy("ts", "asc"));

    const unsubscribe = onSnapshot(frenletsQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          setFrenletDocPaths((prev) => [change.doc.ref.path, ...prev]);
        } else if (change.type === "removed") {
          setFrenletDocPaths((prev) =>
            prev.filter((path) => path !== change.doc.ref.path)
          );
        }
      });
    });

    return () => unsubscribe();
  }, [username]);

  // Dynamic Data Fetching
  useEffect(() => {
    const userDocRef = doc(firestore, `/users/${username}`);

    const unsubscribe = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          console.error("User's realtime data can not be fecthed.");
          return setUserData(null);
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
  }, [username]);

  if (!userData)
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          height: height,
        }}
      >
        <ActivityIndicator color="white" size="large" />
      </View>
    );

  return (
    <>
      <Header userData={userData} />
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
          Frens
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
      {toggleValue === "frenlets" && (
        <>
          <CreateFrenlet username={username} />
          <FlatList
            contentContainerStyle={{
              gap: 20,
            }}
            keyExtractor={(item) => item}
            data={frenletDocPaths}
            renderItem={({ item }) => (
              <Frenlet frenletDocPath={item} key={item} />
            )}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </>
      )}
    </>
  );
};

export default UserContent;
