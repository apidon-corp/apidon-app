import UserCard from "@/components/User/UserCard";
import { UserInServer } from "@/types/User";
import firestore from "@react-native-firebase/firestore";
import { Stack } from "expo-router";
import React, { useState } from "react";
import { FlatList } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const search = () => {
  const [queryResult, setQueryResult] = useState<string[]>([]);

  const handleGetQueryResult = async (input: string) => {
    try {
      const firstLetter = input[0];
      const firstLetterUpperCase = firstLetter.toUpperCase();

      const newInput = firstLetterUpperCase + input.slice(1);

      const [usernameQueryResult, fullnameQueryResult] = await Promise.all([
        await firestore()
          .collection("users")
          .where("username", ">=", input.toLowerCase())
          .where("username", "<", input.toLowerCase() + "\uf8ff")
          .limit(5)
          .get(),
        await firestore()
          .collection("users")
          .where("fullname", ">=", newInput)
          .where("fullname", "<", newInput + "\uf8ff")
          .limit(5)
          .get(),
      ]);

      const usersAll = [
        ...usernameQueryResult.docs.map((doc) => doc.data() as UserInServer),
        ...fullnameQueryResult.docs.map((doc) => doc.data() as UserInServer),
      ];

      const intialValue: string[] = [];

      const usernames = usersAll.reduce((acc, user) => {
        if (!acc.includes(user.username)) acc.push(user.username);
        return acc;
      }, intialValue);

      setQueryResult(usernames);
    } catch (error) {
      console.error("Error getting query results:", error);
    }
  };

  const handleInputChange = (input: string) => {
    if (input.length === 0) return setQueryResult([]);
    handleGetQueryResult(input);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerLargeTitle: true,
          headerSearchBarOptions: {
            placeholder: "Search",
            inputType: "text",
            onChangeText: (event) => handleInputChange(event.nativeEvent.text),
          },
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingHorizontal: 20,
        }}
      >
        <FlatList
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item}
          data={queryResult}
          renderItem={({ item }) => <UserCard username={item} />}
        />
      </ScrollView>
    </>
  );
};

export default search;
