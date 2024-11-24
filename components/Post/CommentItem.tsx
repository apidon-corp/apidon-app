import { Text } from "@/components/Text/Text";
import apiRoutes from "@/helpers/ApiRoutes";
import { CommentServerData } from "@/types/Post";
import { UserInServer } from "@/types/User";
import { Entypo, Feather, MaterialIcons } from "@expo/vector-icons";
import firestore from "@react-native-firebase/firestore";
import {
  formatDistanceStrict,
  formatDistanceToNow,
  formatDistanceToNowStrict,
} from "date-fns";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, View } from "react-native";
import auth from "@react-native-firebase/auth";
import appCheck from "@react-native-firebase/app-check";
import { router, usePathname } from "expo-router";
import { apidonPink } from "@/constants/Colors";

type Props = {
  commentServerData: CommentServerData;
  postDocPath: string;
};

const CommentItem = ({
  commentServerData: { message, sender, ts },
  postDocPath,
}: Props) => {
  const pathname = usePathname();

  const [userData, setUserData] = useState<UserInServer | null>(null);
  const [loading, setLoading] = useState(false);

  const [doesOwnComment, setDoesOwnComment] = useState(false);

  const [commentDeleteLoading, setCommentDeleteLoading] = useState(false);

  const [commentDeleted, setCommentDeleted] = useState(false);

  const [currentUserBlockedBySender, setCurrentUserBlockedBySender] = useState<
    null | boolean
  >(null);

  // Realtime Block Checking
  useEffect(() => {
    const displayName = auth().currentUser?.displayName || "";
    if (!displayName) return;

    if (sender === displayName) return setCurrentUserBlockedBySender(false);

    const unsubscribe = firestore()
      .doc(`users/${sender}/blocks/${displayName}`)
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
  }, [sender]);

  useEffect(() => {
    if (sender) handleGetUserData();
  }, [sender]);

  useEffect(() => {
    if (sender) {
      const displayName = auth().currentUser?.displayName;
      setDoesOwnComment(sender === displayName);
    }
  }, [sender]);

  const handleGetUserData = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const userDocSnapshot = await firestore().doc(`users/${sender}`).get();

      if (!userDocSnapshot.exists) return;

      const userDocData = userDocSnapshot.data() as UserInServer;

      setUserData(userDocData);
      return setLoading(false);
    } catch (error) {
      console.error("Error on getting initial data: ", error);
      return setLoading(false);
    }
  };

  const handleDeleteButton = () => {
    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: handleDeleteComment,
          style: "destructive",
        },
      ]
    );
  };

  const handleDeleteComment = async () => {
    if (commentDeleteLoading) return;

    setCommentDeleteLoading(true);

    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return console.error("User is not logged");

    const commentObject: CommentServerData = {
      message: message,
      sender: sender,
      ts: ts,
    };

    try {
      const idToken = await currentUserAuthObject.getIdToken();
      const { token: appchecktoken } = await appCheck().getLimitedUseToken();
      const response = await fetch(apiRoutes.post.comment.postCommentDelete, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
          appchecktoken: appchecktoken,
        },
        body: JSON.stringify({
          postDocPath: postDocPath,
          commentObject: commentObject,
        }),
      });

      if (!response.ok) {
        setCommentDeleteLoading(false);
        return console.error(
          "Response from postCommentDelete API is not okay: ",
          await response.text()
        );
      }

      setCommentDeleted(true);
      setCommentDeleteLoading(false);
      // Okay
    } catch (error) {
      setCommentDeleteLoading(false);
      return console.error("Error on deleting comment: ", error);
    }
  };

  const handlePressUser = () => {
    const subScreens = pathname.split("/");

    subScreens[subScreens.length - 1] = `profilePage?username=${sender}`;

    const finalDestination = subScreens.join("/");

    router.push(finalDestination);
  };

  if (commentDeleted) return <></>;

  if (loading || !userData || currentUserBlockedBySender === null)
    return (
      <View
        style={{
          width: "100%",
          height: 75,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color="white" />
      </View>
    );

  if (currentUserBlockedBySender || userData.isScheduledToDelete) return <></>;

  return (
    <Pressable
      onPress={handlePressUser}
      id="root-comment"
      style={{
        width: "100%",
        paddingVertical: 5,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            gap: 6,
            flex: 1, // This allows the comment section to take available space
            maxWidth: "90%",
          }}
          id="image-username-comment"
        >
          <Image
            source={
              userData.profilePhoto || require("@/assets/images/user.jpg")
            }
            style={{
              width: 40,
              aspectRatio: 1,
              borderRadius: 25,
            }}
            transition={500}
          />

          <View
            id="username-comment"
            style={{
              flexDirection: "column",
              gap: 3,
              flex: 1, // This ensures the text container takes remaining space
            }}
          >
            <View
              id="username-verified-ts"
              style={{
                flexDirection: "row",
                alignItems: "center",
                flexWrap: "wrap", // Allows username section to wrap if needed
                gap: 3,
              }}
            >
              <Text fontSize={11} bold>
                {userData.username}
              </Text>
              {userData.verified && (
                <MaterialIcons name="verified" size={16} color={apidonPink} />
              )}

              <Entypo name="dot-single" size={12} color="gray" />
              <Text
                style={{
                  fontSize: 9,
                  color: "gray",
                }}
              >
                {formatDistanceToNowStrict(new Date(ts))}
              </Text>
            </View>
            <View
              id="comment"
              style={{
                flex: 1, // Takes remaining vertical space
              }}
            >
              <Text
                fontSize={12}
                style={{
                  flexWrap: "wrap", // Ensures text wraps
                }}
              >
                {message}
                {message}
                {message}
                {message}
                {message}
                {message}
                {message}
                {message}
                {message}
                {message}
                {message}
                {message}
              </Text>
            </View>
          </View>
        </View>

        {doesOwnComment && (
          <Pressable
            onPress={handleDeleteButton}
            style={{
              height: 45,
              justifyContent: "center",
              paddingLeft: 8, // Add some spacing between text and delete button
            }}
          >
            {commentDeleteLoading ? (
              <ActivityIndicator color="red" />
            ) : (
              <Feather name="delete" size={18} color="red" />
            )}
          </Pressable>
        )}
      </View>
    </Pressable>
  );
};

export default CommentItem;
