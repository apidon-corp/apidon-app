import UserCard from "@/components/User/UserCard";
import { firestore } from "@/firebase/client";
import { UserInServer } from "@/types/User";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import React, { useState } from "react";
import { FlatList, TextInput, View } from "react-native";

const search = () => {
  const [queryResult, setQueryResult] = useState<string[]>([]);

  const handleGetQueryResult = async (input: string) => {
    try {
      const usersCollection = collection(firestore, "/users");

      const usernameQuery = query(
        usersCollection,
        where("username", ">=", input.toLowerCase()),
        where("username", "<", input.toLowerCase() + "\uf8ff"),
        limit(5)
      );

      const firstLetter = input[0];
      const firstLetterUpperCase = firstLetter.toUpperCase();

      const newInput = firstLetterUpperCase + input.slice(1);

      const fullnameQuery = query(
        usersCollection,
        where("fullname", ">=", newInput),
        where("fullname", "<", newInput + "\uf8ff"),
        limit(5)
      );

      const [usernameQueryResult, fullnameQueryResult] = await Promise.all([
        getDocs(usernameQuery),
        getDocs(fullnameQuery),
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
    <View style={{ flex: 1, padding: 10, gap: 20 }}>
      <View>
        <TextInput
          onChangeText={handleInputChange}
          style={{
            borderWidth: 1,
            borderColor: "gray",
            borderRadius: 10,
            padding: 10,
            color: "white",
          }}
          placeholder="Search users"
          placeholderTextColor="gray"
        />
      </View>

      <FlatList
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item}
        data={queryResult}
        renderItem={({ item }) => <UserCard username={item} key={item} />}
      />
    </View>
  );
};

export default search;
