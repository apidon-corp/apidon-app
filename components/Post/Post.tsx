import { Text } from "@/components/Text/Text";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  View,
} from "react-native";

import { auth, firestore } from "@/firebase/client";
import { PostServerData } from "@/types/Post";
import { UserInServer } from "@/types/User";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";

import { Entypo, FontAwesome } from "@expo/vector-icons";

import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import { formatDistanceToNow } from "date-fns";
import { router } from "expo-router";
import { useSetAtom } from "jotai";
import RateStar from "./Rating/RateStar";
import Stars from "./Rating/Stars";
import { Image } from "expo-image";

type Props = {
  postDocPath: string;
};

const Post = ({ postDocPath }: Props) => {
  const [loading, setLoading] = useState(false);

  const [postDocData, setPostDocData] = useState<PostServerData | null>(null);
  const [postSenderData, setPostSenderData] = useState<UserInServer | null>(
    null
  );

  const setScreenParameters = useSetAtom(screenParametersAtom);

  const [doesOwnPost, setDoesOwnPost] = useState(false);
  const [doesFollow, setDoesFollow] = useState(true);

  const [postDeleted, setPostDeleted] = useState(false);

  const animatedScaleValue = useRef(new Animated.Value(1)).current;

  const handleGetPostSenderInformation = async (senderUsername: string) => {
    try {
      const userDocRef = doc(firestore, `/users/${senderUsername}`);

      const userDocSnapshot = await getDoc(userDocRef);
      if (!userDocSnapshot.exists()) return setPostSenderData(null);

      const userDocData = userDocSnapshot.data() as UserInServer;

      return setPostSenderData(userDocData);
    } catch (error) {
      console.error("Error on getting initial data: ", error);
      return setPostSenderData(null);
    }
  };

  const handleOpenLikeModal = () => {
    setScreenParameters([{ queryId: "postDocPath", value: postDocPath }]);
    router.push("/(modals)/likes");
  };
  const handleOpenCommentsModal = () => {
    setScreenParameters([{ queryId: "postDocPath", value: postDocPath }]);
    router.push("/(modals)/comments");
  };

  const handleDeleteButton = () => {
    Alert.alert("Delete Post", "Are you sure to delete this post?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: handleDeletePost,
      },
    ]);
  };

  const handleDeletePost = async () => {
    const currentUserAuthObject = auth.currentUser;
    if (!currentUserAuthObject) return console.log("No user is logged in.");

    const userPanelBaseUrl = process.env.EXPO_PUBLIC_USER_PANEL_ROOT_URL;
    if (!userPanelBaseUrl)
      return console.error("User panel base url couldnt fetch from .env file");

    const route = `${userPanelBaseUrl}/api/postv2/postDelete`;

    Animated.timing(animatedScaleValue, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      setPostDeleted(true);
    }, 250);

    try {
      const idToken = await currentUserAuthObject.getIdToken();

      const response = await fetch(route, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          postDocPath: postDocPath,
        }),
      });

      if (!response.ok) {
        const message = await response.text();

        Animated.timing(animatedScaleValue, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();

        setPostDeleted(false);

        return console.error(
          "Response from deletePost API is not okay: ",
          message
        );
      }

      return console.log("Post Deleted Successfully");
    } catch (error) {
      Animated.timing(animatedScaleValue, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();

      return console.error("Error on deleting post: ", error);
    }
  };
  // Dynamic Data Fetching
  useEffect(() => {
    if (postDeleted) return;

    setLoading(true);

    const postDocRef = doc(firestore, postDocPath);
    const unsubscribe = onSnapshot(
      postDocRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          console.log("Post's realtime data can not be fecthed.");
          return setLoading(false);
        }
        const postDocData = snapshot.data() as PostServerData;
        setPostDocData(postDocData);

        if (!postSenderData)
          handleGetPostSenderInformation(postDocData.senderUsername);

        setDoesOwnPost(
          postDocData.senderUsername === auth.currentUser?.displayName
        );

        return setLoading(false);
      },
      (error) => {
        console.error("Error on getting realtime data: ", error);
        return setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [postDocPath, auth, postDeleted]);

  if (loading)
    return (
      <View
        style={{
          width: "100%",
          height: 500,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="white" />
      </View>
    );

  if (!postDocData || !postSenderData || postDeleted) return <></>;

  return (
    <>
      <Animated.View
        id="post-root"
        style={{
          width: "100%",
          transform: [
            {
              scale: animatedScaleValue,
            },
          ],
        }}
      >
        <View
          id="header"
          style={{
            width: "100%",
            height: 75,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 10,
            gap: 10,
            justifyContent: "space-between",
          }}
        >
          <Pressable
            style={{
              flexDirection: "row",
              gap: 10,
              alignItems: "center",
            }}
            onPress={() => {
              router.push(`/home/profile/${postSenderData.username}`);
            }}
          >
            <Image
              source={postSenderData.profilePhoto}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
              }}
              transition={500}
            />
            <View
              id="username-fullname-time"
              style={{
                flexDirection: "row",
                gap: 5,
              }}
            >
              <View
                id="username-fullname"
                style={{
                  gap: 1,
                }}
              >
                <Text
                  bold
                  style={{
                    fontSize: 15,
                  }}
                >
                  {postSenderData.username}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 15,
                    }}
                  >
                    {postSenderData.fullname}
                  </Text>
                  <Entypo name="dot-single" size={15} color="gray" />
                  <Text style={{ fontSize: 15, color: "gray" }}>
                    {formatDistanceToNow(new Date(postDocData.creationTime))}
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
          {doesOwnPost && (
            <Pressable
              style={{
                borderWidth: 1,
                borderColor: "red",
                borderRadius: 5,
                padding: 5,
              }}
              onPress={handleDeleteButton}
            >
              <Text
                style={{
                  fontSize: 13,
                }}
                bold
              >
                Delete
              </Text>
            </Pressable>
          )}
        </View>

        {postDocData.image && (
          <Image
            source={postDocData.image}
            style={{
              width: "100%",
              height: 350,
            }}
            transition={500}
          />
        )}

        <View
          id="footer"
          style={{
            width: "100%",
            gap: 5,
            paddingHorizontal: 5,
          }}
        >
          <View
            id="starts-star-comment"
            style={{
              width: "100%",
              height: 50,
              flexDirection: "row",
              alignContent: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                width: "33%",
                justifyContent: "center",
              }}
            >
              <Stars score={3.2} />
            </View>

            <View
              style={{
                width: "33%",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
              }}
            >
              <RateStar />
            </View>

            <View
              style={{
                width: "33%",
                justifyContent: "center",
                alignItems: "flex-end",
              }}
            >
              <FontAwesome name="comments" size={30} color="white" />
            </View>
          </View>

          <Pressable onPress={handleOpenCommentsModal} style={{ height: 50 }}>
            <View
              id="comments-preview"
              style={{
                gap: 3,
              }}
            >
              <View
                id="description"
                style={{
                  flexDirection: "row",
                  gap: 6,
                }}
              >
                <Text bold>{postSenderData.username}</Text>
                <Text>{postDocData.description}</Text>
              </View>
              <View
                id="comment-count"
                style={{
                  flexDirection: "row",
                  gap: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: "gray",
                  }}
                >
                  {postDocData.commentCount} comments
                </Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* {postDocData.description && (
          <Text
            bold
            style={{
              fontSize: 15,
              height: 25,
              paddingHorizontal: 10,
            }}
          >
            {postDocData.description}
          </Text>
        )} */}

        {/* <View
          id="footer"
          style={{
            width: "100%",
            flexDirection: "row",
            paddingHorizontal: 10,
            gap: 10,
          }}
        >
          <View
            id="like"
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 5,
            }}
          >
            <AntDesign name="heart" size={24} color="red" />
            <Pressable onPress={handleOpenLikeModal}>
              <Text
                style={{
                  fontSize: 16,
                }}
              >
                {postDocData.likeCount}
              </Text>
            </Pressable>
          </View>
          <Pressable
            onPress={handleOpenCommentsModal}
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 5,
            }}
          >
            <FontAwesome name="comments-o" size={24} color="white" />
            <Text
              style={{
                fontSize: 16,
              }}
            >
              {postDocData.commentCount}
            </Text>
          </Pressable>
        </View> */}
      </Animated.View>
    </>
  );
};

export default Post;
