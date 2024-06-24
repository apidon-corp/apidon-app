import { apidonPink } from "@/constants/Colors";
import { auth } from "@/firebase/client";
import { GetPersonalizedUserFeedAPIResponseBody } from "@/types/ApiResponses";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { FlatList, Switch } from "react-native-gesture-handler";
import Post from "../Post/Post";

import { Text } from "@/components/Text/Text";
import Frenlet from "../Frenlet/Frenlet";

type Props = {
  username: string;
};

const UserContent = ({ username }: Props) => {
  const [contentLoading, setContentLoading] = useState(false);

  const [postDocPathArray, setPostDocPathArray] = useState<string[]>([]);
  const [frenletDocPaths, setFrenletDocPaths] = useState<string[]>([]);

  const [toggleValue, setToggleValue] = useState<"posts" | "frenlets">("posts");

  const handleGetUserFeed = async () => {
    if (contentLoading) return;

    const currentUserAuthObject = auth.currentUser;
    if (!currentUserAuthObject) return false;

    const userPanelBaseUrl = process.env.EXPO_PUBLIC_USER_PANEL_ROOT_URL;
    if (!userPanelBaseUrl) {
      console.error("User panel base url couldnt fetch from .env file");
      return false;
    }

    const route = `${userPanelBaseUrl}/api/feed/user/getPersonalizedUserFeed`;

    setContentLoading(true);

    try {
      const idToken = await currentUserAuthObject.getIdToken();

      const response = await fetch(route, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          username: username,
        }),
      });

      if (!response.ok) {
        console.error(
          "Response from getPersonalizedUserFeed is not okay: ",
          await response.text()
        );
        setContentLoading(false);
        return false;
      }

      const result =
        (await response.json()) as GetPersonalizedUserFeedAPIResponseBody;

      const postDocPathsFetched = result.postDocPaths;
      const frenletDocPathsFetched = result.frenletDocPaths;

      setPostDocPathArray(postDocPathsFetched);
      setFrenletDocPaths(frenletDocPathsFetched);

      setContentLoading(false);
    } catch (error) {
      console.error(
        "Error on fetching to getPersonalizedUserFeed API: ",
        error
      );
      setContentLoading(false);
      return false;
    }
  };

  const onToggleValueChange = () => {
    setToggleValue((prev) => (prev === "posts" ? "frenlets" : "posts"));
  };

  useEffect(() => {
    if (username) {
      handleGetUserFeed();
    }
  }, [username]);

  return (
    <>
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
      )}
    </>
  );
};

export default UserContent;
