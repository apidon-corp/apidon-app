import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import CommentItem from "@/components/Post/CommentItem";
import { Text } from "@/components/Text/Text";
import firestore from "@react-native-firebase/firestore";
import apiRoutes from "@/helpers/ApiRoutes";
import { CommentServerData, PostServerData } from "@/types/Post";
import { UserInServer } from "@/types/User";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useAtomValue } from "jotai";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Keyboard,
  Pressable,
  SafeAreaView,
  TextInput,
  View,
} from "react-native";

import auth from "@react-native-firebase/auth";

import appCheck from "@react-native-firebase/app-check";

const comments = () => {
  const screenParameters = useAtomValue(screenParametersAtom);

  const postDocPath = screenParameters.find(
    (query) => query.queryId === "postDocPath"
  )?.value as string;

  const [loading, setLoading] = useState(false);
  const [commentData, setCommentData] = useState<CommentServerData[]>([]);

  const [currentUserData, setCurrentUserData] = useState<UserInServer | null>(
    null
  );
  const [currentUserLoading, setCurrentUserLoading] = useState(false);

  const [comment, setComment] = useState("");
  const [sendCommentLoading, setSendCommentLoading] = useState(false);

  const animatedOpacityValue = useRef(new Animated.Value(1)).current;

  const screenHeight = Dimensions.get("window").height;
  const animatedTranslateValue = useRef(new Animated.Value(0)).current;
  const containerRef = useRef<null | View>(null);

  // Dynamic Data Fetching
  useEffect(() => {
    if (!postDocPath) return;

    if (loading) return;
    setLoading(true);

    const unsubscribe = firestore()
      .doc(postDocPath)
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) {
            console.log("Post's realtime data can not be fecthed.");
            return setLoading(false);
          }
          const postDocData = snapshot.data() as PostServerData;

          const sortedComments = postDocData.comments;
          sortedComments.sort((a, b) => b.ts - a.ts);

          setCommentData(sortedComments);

          return setLoading(false);
        },
        (error) => {
          console.error("Error on getting realtime data: ", error);
          return setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [postDocPath]);

  useEffect(() => {
    if (postDocPath) handleGetCurrentUserData();
  }, [postDocPath]);

  useEffect(() => {
    Animated.timing(animatedOpacityValue, {
      toValue: comment.length > 0 ? 1 : 0.5,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [comment.length]);

  // Keyboard-Layout Change
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      "keyboardWillShow",
      (event) => {
        if (Keyboard.isVisible()) return;

        const keyboardHeight = event.endCoordinates.height;

        if (containerRef.current) {
          containerRef.current.measure((x, y, width, height, pageX, pageY) => {
            const containerBottom = pageY + height;
            const distanceFromBottom = screenHeight - containerBottom;

            let toValue = 0;
            if (distanceFromBottom > keyboardHeight) {
              toValue = 0;
            } else {
              toValue = keyboardHeight - distanceFromBottom;
              toValue += 20;
            }

            Animated.timing(animatedTranslateValue, {
              toValue: -toValue,
              duration: 250,
              useNativeDriver: true,
            }).start();
          });
        }
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      "keyboardWillHide",
      (event) => {
        let toValue = 0;

        Animated.timing(animatedTranslateValue, {
          toValue: toValue,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [containerRef]);

  const handleGetCurrentUserData = async () => {
    if (currentUserLoading) return;
    setCurrentUserLoading(true);

    const displayName = auth().currentUser?.displayName;
    if (!displayName) {
      setCurrentUserLoading(false);
      return console.error("Auth object doesn't have auth object");
    }

    try {
      const userDocSnapshot = await firestore()
        .doc(`users/${displayName}`)
        .get();

      if (!userDocSnapshot.exists) {
        setCurrentUserLoading(false);
        return console.error("User doesn't exist in database.");
      }

      const data = userDocSnapshot.data() as UserInServer;

      setCurrentUserData(data);

      return setCurrentUserLoading(false);
    } catch (error) {
      setCurrentUserLoading(false);
      console.error("Error on getting user data: ", error);
    }
  };

  const handleSendComment = async () => {
    if (sendCommentLoading) return;

    const trimmedComment = comment.trim();

    if (trimmedComment.length === 0) return;

    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return console.error("User is not logged");

    setSendCommentLoading(true);

    try {
      const idToken = await currentUserAuthObject.getIdToken();
      const { token: appchecktoken } = await appCheck().getLimitedUseToken();
      const response = await fetch(apiRoutes.post.comment.postComment, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
          appchecktoken,
        },
        body: JSON.stringify({
          message: trimmedComment,
          postDocPath: postDocPath,
        }),
      });

      if (!response.ok) {
        setSendCommentLoading(false);
        return console.error(
          "Response from postComment API is not okay: ",
          await response.text()
        );
      }

      Keyboard.dismiss();
      setComment("");
      return setSendCommentLoading(false);
    } catch (error) {
      setSendCommentLoading(false);
      return console.error("Error on sending comment: ", error);
    }
  };

  if (!postDocPath) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text>Internal Server Error</Text>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color="white" />
      </SafeAreaView>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        paddingBottom: 100,
      }}
    >
      <FlatList
        data={commentData}
        contentContainerStyle={{
          padding: 10,
        }}
        renderItem={({ item }) => (
          <CommentItem
            commentServerData={item}
            postDocPath={postDocPath}
            key={`${item.sender}-${item.message}-${item.ts}`}
          />
        )}
        keyExtractor={(item) => `${item.sender}-${item.message}-${item.ts}`}
      />
      {currentUserData && (
        <Animated.View
          ref={containerRef}
          style={{
            backgroundColor: "black",
            zIndex: 1,
            position: "absolute",
            bottom: 20,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.25)",
            borderRadius: 20,
            flexDirection: "row",
            width: "95%",
            height: 75,
            alignSelf: "center",
            justifyContent: "space-between",
            padding: 10,
            transform: [
              {
                translateY: animatedTranslateValue,
              },
            ],
          }}
        >
          <Image
            source={
              currentUserData.profilePhoto ||
              require("@/assets/images/user.jpg")
            }
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
            }}
            transition={500}
          />
          <TextInput
            placeholderTextColor="#808080"
            placeholder={"Comment as " + currentUserData.username + "..."}
            style={{
              width: "70%",
              height: 50,
              padding: 10,
              borderColor: "rgba(255,255,255,0.25)",
              borderWidth: 1,
              borderRadius: 20,
              color: "white",
            }}
            value={comment}
            onChangeText={(input) => {
              setComment(input);
            }}
          />
          <Animated.View
            style={{
              opacity: animatedOpacityValue,
              width: "10%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Pressable
              disabled={sendCommentLoading || comment.length === 0}
              onPress={handleSendComment}
              style={{
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {sendCommentLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Ionicons name="send" size={24} color="white" />
              )}
            </Pressable>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
};

export default comments;
