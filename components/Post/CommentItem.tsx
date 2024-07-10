import { View, ActivityIndicator, Alert, Pressable } from "react-native";
import { Text } from "@/components/Text/Text";
import React, { useEffect, useState } from "react";
import { CommentServerData } from "@/types/Post";
import { UserInServer } from "@/types/User";
import { auth, firestore } from "@/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import { Image } from "expo-image";
import { Entypo, Feather } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import apiRoutes from "@/helpers/ApiRoutes";

type Props = {
  commentServerData: CommentServerData;
  postDocPath: string;
};

const CommentItem = ({
  commentServerData: { message, sender, ts },
  postDocPath,
}: Props) => {
  const [userData, setUserData] = useState<UserInServer | null>(null);
  const [loading, setLoading] = useState(false);

  const [doesOwnComment, setDoesOwnComment] = useState(false);

  const [commentDeleteLoading, setCommentDeleteLoading] = useState(false);

  useEffect(() => {
    if (sender) handleGetUserData();
  }, [sender]);

  useEffect(() => {
    if (sender) {
      const displayName = auth.currentUser?.displayName;
      setDoesOwnComment(sender === displayName);
    }
  }, [sender]);

  const handleGetUserData = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const userDocRef = doc(firestore, `/users/${sender}`);

      const userDocSnapshot = await getDoc(userDocRef);

      if (!userDocSnapshot.exists()) return;

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

    const currentUserAuthObject = auth.currentUser;
    if (!currentUserAuthObject) return console.error("User is not logged");

    const commentObject: CommentServerData = {
      message: message,
      sender: sender,
      ts: ts,
    };

    try {
      const idToken = await currentUserAuthObject.getIdToken();
      const response = await fetch(apiRoutes.post.comment.postCommentDelete, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
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

      setCommentDeleteLoading(false);
      // Okay
    } catch (error) {
      setCommentDeleteLoading(false);
      return console.error("Error on deleting comment: ", error);
    }
  };

  if (loading || !userData)
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

  return (
    <View
      style={{
        flexDirection: "row",
        padding: 5,
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          gap: 10,
          alignItems: "center",
        }}
      >
        <Image
          source={userData.profilePhoto || require("@/assets/images/user.jpg")}
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
          }}
          transition={500}
        />
        <View
          style={{
            gap: 4,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              gap: 1,
              alignItems: "center",
            }}
          >
            <Text bold>{userData.username}</Text>
            <Entypo name="dot-single" size={20} color="gray" />
            <Text
              style={{
                fontSize: 10,
                color: "gray",
              }}
            >
              {formatDistanceToNow(new Date(ts))}
            </Text>
          </View>

          <Text>{message}</Text>
        </View>
      </View>

      {doesOwnComment && (
        <Pressable
          onPress={handleDeleteButton}
          style={{
            alignItems: "center",
          }}
        >
          {commentDeleteLoading ? (
            <ActivityIndicator color="red" />
          ) : (
            <Feather name="delete" size={24} color="red" />
          )}
        </Pressable>
      )}
    </View>
  );
};

export default CommentItem;
