import CommentItem from "@/components/Post/CommentItem";
import { Text } from "@/components/Text/Text";
import apiRoutes from "@/helpers/ApiRoutes";
import { CommentServerData } from "@/types/Post";
import { UserInServer } from "@/types/User";
import { Ionicons } from "@expo/vector-icons";
import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Keyboard,
  NativeScrollEvent,
  Pressable,
  SafeAreaView,
  ScrollView,
  TextInput,
  View,
} from "react-native";

import auth from "@react-native-firebase/auth";

import appCheck from "@react-native-firebase/app-check";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Comments = () => {
  const { sender, id } = useLocalSearchParams<{
    sender: string;
    id: string;
  }>();
  let postDocPath = "";
  if (!sender || !id) postDocPath = "";
  postDocPath = `users/${sender}/posts/${id}`;

  const [commentDocSnapshots, setCommentDocSnapshots] = useState<
    | FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>[]
    | null
  >(null);

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

  const { bottom } = useSafeAreaInsets();

  const scrollViewRef = useRef<ScrollView>(null);

  // Getting initial comments
  useEffect(() => {
    if (postDocPath) handleGetInitialComments();
  }, [postDocPath]);

  /**
   * Getting profile picture of current user.
   */
  useEffect(() => {
    if (postDocPath) handleGetCurrentUserData();
  }, [postDocPath]);

  /**
   * Handling opacity of "send" button.
   */
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

      // To show user his new comment.
      await handleGetInitialComments();
      return setSendCommentLoading(false);
    } catch (error) {
      setSendCommentLoading(false);
      return console.error("Error on sending comment: ", error);
    }
  };

  const handleGetInitialComments = async () => {
    if (!postDocPath) return;

    const query = await firestore()
      .doc(postDocPath)
      .collection("comments")
      .orderBy("ts", "desc")
      .limit(15)
      .get();

    scrollViewRef.current?.scrollTo({ y: 0, animated: true });

    setCommentDocSnapshots(query.docs);
  };

  const serveMoreComments = async () => {
    if (!postDocPath) return;
    if (!commentDocSnapshots) return;

    const lastDoc = commentDocSnapshots[commentDocSnapshots.length - 1];
    if (!lastDoc) return;

    const query = await firestore()
      .doc(postDocPath)
      .collection("comments")
      .orderBy("ts", "desc")
      .startAfter(lastDoc)
      .limit(5)
      .get();

    setCommentDocSnapshots((prev) => [
      ...(prev as FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>[]),
      ...query.docs,
    ]);
  };

  const handleScroll = (event: NativeScrollEvent) => {
    const threshold = 50;

    const { layoutMeasurement, contentOffset, contentSize } = event;

    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - threshold;
    if (isCloseToBottom) {
      serveMoreComments();
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

  if (!commentDocSnapshots) {
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

  if (commentDocSnapshots.length === 0) {
    return (
      <>
        <SafeAreaView
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text>No Comments yet.</Text>
        </SafeAreaView>

        {currentUserData && (
          <Animated.View
            ref={containerRef}
            style={{
              backgroundColor: "black",
              zIndex: 1,
              bottom: bottom || 20, //+ 60 + 10,
              position: "absolute",
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
      </>
    );
  }

  return (
    <>
      <ScrollView
        ref={scrollViewRef}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: (bottom || 20) + 80,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={({ nativeEvent }) => handleScroll(nativeEvent)}
        scrollEventThrottle={500}
      >
        {commentDocSnapshots.length !== 0 && (
          <FlatList
            scrollEnabled={false}
            data={Array.from(new Set(commentDocSnapshots)).map(
              (d) => d.data() as CommentServerData
            )}
            contentContainerStyle={{
              gap: 5,
              paddingHorizontal: 10,
              paddingVertical: 5,
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
        )}
      </ScrollView>

      {currentUserData && (
        <Animated.View
          ref={containerRef}
          style={{
            backgroundColor: "black",
            zIndex: 1,
            bottom: bottom || 20, //+ 60 + 10,
            position: "absolute",
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
    </>
  );
};

export default Comments;
