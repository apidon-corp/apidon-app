import { Text } from "@/components/Text/Text";
import { apidonPink } from "@/constants/Colors";
import { useAuth } from "@/providers/AuthProvider";
import { UserInServer } from "@/types/User";
import firestore from "@react-native-firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, View } from "react-native";
import { FlatList, Switch } from "react-native-gesture-handler";
import CreateFrenlet from "../Frenlet/CreateFrenlet";
import Frenlet from "../Frenlet/Frenlet";
import Post from "../Post/Post";
import Header from "./Header";

type Props = {
  username: string;
};

const UserContent = ({ username }: Props) => {
  const authStatus = useAuth();

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
    if (authStatus !== "authenticated") return;
    if (!username) return;

    setPostDocPathArray([]);

    const unsubscribe = firestore()
      .collection(`users/${username}/posts`)
      .orderBy("creationTime", "desc")
      .onSnapshot((snapshot) => {
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
  }, [username, authStatus]);

  // Frenlet Fetching
  useEffect(() => {
    if (authStatus !== "authenticated") return;

    if (!username) return;

    setFrenletDocPaths([]);

    const unsubscribe = firestore()
      .collection(`users/${username}/frenlets/frenlets/incoming`)
      .orderBy("ts", "asc")
      .onSnapshot((snapshot) => {
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
  }, [username, authStatus]);

  // Dynamic Data Fetching
  useEffect(() => {
    if (authStatus !== "authenticated") return;
    if (!username) return;

    const unsubscribe = firestore()
      .doc(`users/${username}`)
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) {
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
  }, [username, authStatus]);

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
