import Text from "@/components/Text/Text";
import UserCard from "@/components/User/UserCard";
import { UserInServer } from "@/types/User";
import { AntDesign } from "@expo/vector-icons";
import firestore from "@react-native-firebase/firestore";
import { Stack, usePathname } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, View, Platform } from "react-native";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SearchBarCommands } from "react-native-screens";

const search = () => {
  const pathname = usePathname();

  const [queryResult, setQueryResult] = useState<string[]>([]);

  const [popularPeople, setPopularPeople] = useState<string[]>([]);

  const { bottom } = useSafeAreaInsets();

  const isIOS = Platform.OS === "ios";

  const handleGetQueryResult = async (input: string) => {
    try {
      const firstLetter = input[0];
      const firstLetterUpperCase = firstLetter.toUpperCase();

      const newInput = firstLetterUpperCase + input.slice(1);

      const [usernameQueryResult, fullnameQueryResult] = await Promise.all([
        firestore()
          .collection("users")
          .where("username", ">=", input.toLowerCase())
          .where("username", "<", input.toLowerCase() + "\uf8ff")
          .limit(5)
          .get(),
        firestore()
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

  const handleGetPopularPeople = async () => {
    try {
      const popularPeopleQuery = await firestore()
        .collection("users")
        .orderBy("followerCount", "desc")
        .limit(5)
        .get();

      const popularPeopleFetched: string[] = [];
      for (const popularPerson of popularPeopleQuery.docs) {
        popularPeopleFetched.push(popularPerson.id);
      }
      setPopularPeople(popularPeopleFetched);
    } catch (error) {
      console.error("Error getting popular people:", error);
      setPopularPeople([]);
    }
  };

  useEffect(() => {
    if (pathname === "/home/search") handleGetPopularPeople();
  }, [pathname]);

  return (
    <>
      <Stack.Screen
        options={{
          headerLargeTitle: isIOS ? true : undefined,
          title: "Search",
          headerTitleStyle: isIOS
            ? undefined
            : {
                fontSize: 28,
                fontWeight: "bold",
                color: "white",
              },
          headerSearchBarOptions: isIOS
            ? {
                placeholder: "Search",
                inputType: "text",
                onChangeText: (event) =>
                  handleInputChange(event.nativeEvent.text),
                hideWhenScrolling: false,
              }
            : undefined,
        }}
      />

      <View style={{ paddingHorizontal: 15, display: isIOS ? "none" : "flex" }}>
        <View
          style={{
            width: "100%",
            height: 35,
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: 10,
            paddingHorizontal: 10,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View style={{ width: "7%" }}>
            <AntDesign name="search1" size={16} color="gray" />
          </View>

          <TextInput
            style={{
              width: "90%",
              height: 35,
              color: "white",
            }}
            placeholder="Search"
            placeholderTextColor="gray"
            onChangeText={(text) => {
              handleInputChange(text);
            }}
          />
        </View>
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: (bottom || 20) + 60,
        }}
        showsVerticalScrollIndicator={false}
      >
        {queryResult.length > 0 && (
          <FlatList
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item}
            data={queryResult}
            renderItem={({ item }) => <UserCard username={item} />}
          />
        )}

        {queryResult.length === 0 && (
          <View
            id="popular-area"
            style={{
              marginTop: 20,
              width: "100%",
            }}
          >
            <Text
              bold
              fontSize={16}
              style={{
                color: "gray",
              }}
            >
              Suggested People
            </Text>
            {popularPeople.length === 0 && <ActivityIndicator />}
            {popularPeople.length !== 0 && (
              <FlatList
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item}
                data={popularPeople}
                renderItem={({ item }) => <UserCard username={item} />}
              />
            )}
          </View>
        )}
      </ScrollView>
    </>
  );
};

export default search;
