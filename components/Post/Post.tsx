import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import { Text } from "@/components/Text/Text";

import { apidonPink } from "@/constants/Colors";
import apiRoutes from "@/helpers/ApiRoutes";
import { useAuth } from "@/providers/AuthProvider";
import { PostServerData, RatingData } from "@/types/Post";
import { UserInServer } from "@/types/User";
import { Entypo, Feather, MaterialIcons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import firestore from "@react-native-firebase/firestore";
import { formatDistanceToNowStrict } from "date-fns";
import { Image } from "expo-image";
import { Stack, router, usePathname } from "expo-router";
import { useSetAtom } from "jotai";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  View,
  Text as ReactNativeText,
} from "react-native";
import CustomBottomModalSheet from "../BottomSheet/CustomBottomModalSheet";
import RateStar from "./Rating/RateStar";
import Stars from "./Rating/Stars";

import auth from "@react-native-firebase/auth";

import appCheck from "@react-native-firebase/app-check";
import NFTTag from "./NFT/NFTTag";
import NftBottomSheetContent from "./NFT/NftBottomSheetContent";
import PostImage from "./PostImage";

import * as Sharing from "expo-sharing";

type Props = {
  postDocPath: string;
};

const Post = React.memo(({ postDocPath }: Props) => {
  const { authStatus } = useAuth();

  const [loading, setLoading] = useState(false);

  const [postDocData, setPostDocData] = useState<PostServerData | null>(null);
  const [postNotFound, setPostNotFound] = useState(false);
  const [postSenderData, setPostSenderData] = useState<UserInServer | null>(
    null
  );

  const setScreenParameters = useSetAtom(screenParametersAtom);

  const [doesOwnPost, setDoesOwnPost] = useState(false);

  const [doesFollow, setDoesFollow] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const [postDeleteLoading, setPostDeleteLoading] = useState(false);
  const [postDeleted, setPostDeleted] = useState(false);

  const animatedScaleValue = useRef(new Animated.Value(1)).current;

  const postOptionsModalRef = useRef<BottomSheetModal>(null);

  const nftOptionsModalRef = useRef<BottomSheetModal>(null);

  const pathname = usePathname();

  const [ratingOfCurrentUser, setRatingOfCurrentUser] = useState<
    undefined | number
  >(undefined);

  // Dynamic Data Fetching / Post Object
  useEffect(() => {
    if (authStatus !== "authenticated") return;
    if (postDeleted) return;
    if (!postDocPath) return;

    setLoading(true);

    const unsubscribe = firestore()
      .doc(postDocPath)
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) {
            console.log("Post is not found.");
            setPostNotFound(true);
            return setLoading(false);
          }
          const postDocData = snapshot.data() as PostServerData;
          setPostDocData(postDocData);

          setDoesOwnPost(
            postDocData.senderUsername === auth().currentUser?.displayName
          );

          return setLoading(false);
        },
        (error) => {
          console.error(
            "Error on getting realtime data of post: ",
            postDocPath,
            "\n",
            error
          );
          return setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [postDocPath, authStatus, postDeleted]);

  // Dynamic Data Fetching / Follow Status
  useEffect(() => {
    if (authStatus !== "authenticated") return;

    const displayName = auth().currentUser?.displayName;
    if (!displayName) return;

    if (!postDocData) return;

    const unsubscribe = firestore()
      .doc(`users/${postDocData.senderUsername}/followers/${displayName}`)
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) {
            setDoesFollow(false);
          } else {
            setDoesFollow(true);
          }
        },
        (error) => {
          console.error("Error on getting realtime data: ", error);
        }
      );

    return () => unsubscribe();
  }, [authStatus, postDocData]);

  // Dynamic Data Fetching - Post Sender Data
  useEffect(() => {
    if (authStatus !== "authenticated") return;

    const displayName = auth().currentUser?.displayName;

    if (!displayName) return;
    if (!postDocData) return;

    const unsubscribe = firestore()
      .doc(`users/${postDocData.senderUsername}`)
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) {
            console.log("Post sender's realtime data can not be fecthed.");
            return;
          }

          const userData = snapshot.data() as UserInServer;
          setPostSenderData(userData);
        },
        (error) => {
          console.error(
            "Error on getting realtime data of post sender: ",
            error
          );
        }
      );

    return () => unsubscribe();
  }, [authStatus, postDocData]);

  // Dynamic Data Fetching - Current Rating
  useEffect(() => {
    if (authStatus !== "authenticated") return;

    const displayName = auth().currentUser?.displayName || "";
    if (!displayName) return;

    const unsubscribe = firestore()
      .doc(postDocPath)
      .collection("ratings")
      .where("sender", "==", displayName)
      .onSnapshot(
        (snapshot) => {
          if (snapshot.empty) return setRatingOfCurrentUser(undefined);

          const data = snapshot.docs[0].data() as RatingData;

          return setRatingOfCurrentUser(data.rating);
        },
        (error) => {
          console.error("Error on getting realtime data  ", error);
          setRatingOfCurrentUser(undefined);
        }
      );
    return () => unsubscribe();
  }, [authStatus]);

  const handleOpenRatesModal = () => {
    const path = pathname;

    const subScreens = path.split("/");

    const currentScreen = subScreens[subScreens.length - 1];

    const query = `rates?sender=${postSenderData?.username}&id=${postDocData?.id}`;

    if (currentScreen === "feed") {
      subScreens.push(query);
      const route = subScreens.join("/");
      return router.push(route);
    }

    subScreens[subScreens.length - 1] = query;

    const route = subScreens.join("/");
    return router.push(route);
  };

  const handleOpenCommentsModal = () => {
    const path = pathname;

    const subScreens = path.split("/");

    const currentScreen = subScreens[subScreens.length - 1];

    const query = `comments?sender=${postSenderData?.username}&id=${postDocData?.id}`;

    if (currentScreen === "feed") {
      subScreens.push(query);
      const route = subScreens.join("/");
      return router.push(route);
    }

    subScreens[subScreens.length - 1] = query;

    const route = subScreens.join("/");
    return router.push(route);
  };

  const handleOptionsButton = () => {
    postOptionsModalRef.current?.present();
  };

  const handleDeleteButton = () => {
    postOptionsModalRef.current?.close();
    Alert.alert("Delete Post", "Are you sure to delete this post?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        style: "destructive",
        text: "Delete",
        onPress: handleDeletePost,
      },
    ]);
  };

  const handleDeletePost = async () => {
    if (postDeleteLoading) return;

    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return console.log("No user is logged in.");

    setPostDeleteLoading(true);

    try {
      const idToken = await currentUserAuthObject.getIdToken();

      const { token: appchecktoken } = await appCheck().getLimitedUseToken();

      const response = await fetch(apiRoutes.post.postDelete, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
          appchecktoken,
        },
        body: JSON.stringify({
          postDocPath: postDocPath,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        setPostDeleteLoading(false);
        return console.error(
          "Response from deletePost API is not okay: ",
          message
        );
      }

      Animated.timing(animatedScaleValue, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setPostDeleteLoading(false);
        return setPostDeleted(true);
      });
    } catch (error) {
      setPostDeleteLoading(false);
      return console.error("Error on deleting post: ", error);
    }
  };

  const handleCreateNFTButton = () => {
    if (!postDocData) return;
    if (!postDocData.image) return;

    postOptionsModalRef.current?.close();

    setScreenParameters([{ queryId: "postDocPath", value: postDocPath }]);

    router.push("/(modals)/createCollectible");
  };

  const handleFollowButton = async () => {
    if (followLoading) return;
    if (!postDocData?.senderUsername) return;

    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return console.error("No user found!");

    setFollowLoading(true);

    try {
      const idToken = await currentUserAuthObject.getIdToken();
      const { token: appchecktoken } = await appCheck().getLimitedUseToken();

      const response = await fetch(apiRoutes.user.social.follow, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
          appchecktoken,
        },
        body: JSON.stringify({
          operationTo: postDocData.senderUsername,
          opCode: 1,
        }),
      });

      if (!response.ok) {
        console.error(
          "Response from follow API is not okay: ",
          await response.text()
        );
        return setFollowLoading(false);
      }

      setDoesFollow(true);
      return setFollowLoading(false);
    } catch (error) {
      console.error("Error on fetching follow API: : ", error);
      return setFollowLoading(false);
    }
  };

  function closeNFTBottomSheet() {
    nftOptionsModalRef.current?.close();
  }

  function handlePressUser() {
    if (!postSenderData) return;

    // /home/feed
    const path = pathname;

    const subScreens = path.split("/");
    const currentScreen = subScreens[subScreens.length - 1];

    if (currentScreen === "post") {
      subScreens[
        subScreens.length - 1
      ] = `profilePage?username=${postSenderData.username}`;

      const route = subScreens.join("/");
      return router.push(route);
    }

    if (currentScreen === "feed") {
      subScreens.push(`profilePage?username=${postSenderData.username}`);

      const route = subScreens.join("/");
      return router.push(route);
    }

    return console.log("Hmm");
  }

  const handleShareButton = async () => {
    if (!postDocData) return;

    try {
      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (!isSharingAvailable) return;

      const baseURL = process.env.EXPO_PUBLIC_APP_LINK_BASE_URL || "";
      if (!baseURL) return;

      const url =
        baseURL +
        "/" +
        "post" +
        "/" +
        postDocData.senderUsername +
        "-" +
        postDocData.id;

      await Sharing.shareAsync(url, {
        dialogTitle: `Share this post with your friends!`,
        mimeType: "text/plain",
        UTI: "public.plain-text",
      });
    } catch (error) {
      console.error(error);
    }
  };

  function ScreenTitle({ isCollectible }: { isCollectible: boolean }) {
    if (isCollectible) return <></>;

    return (
      <Stack.Screen
        options={{
          title: "Post",
        }}
      />
    );
  }

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
        <ActivityIndicator color="white" />
      </View>
    );

  if (!postDocData || !postSenderData || postDeleted) return <></>;

  if (
    !(
      postDocData.reviewStatus === "approved" ||
      postDocData.reviewStatus === "pending"
    )
  )
    return <></>;

  if (postNotFound) {
    return (
      <View
        style={{
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Post not found.</Text>
      </View>
    );
  }

  return (
    <>
      <ScreenTitle
        isCollectible={postDocData.collectibleStatus.isCollectible}
      />

      <Animated.View
        id="post-root"
        style={{
          position: "relative",
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
            flexDirection: "row",
            alignItems: "center",
            padding: 10,
            justifyContent: "space-between",
            backgroundColor: "black",
          }}
        >
          <View
            id="sender-information"
            style={{
              width: "55%",
              overflow: "hidden",
            }}
          >
            <Pressable
              id="user-data"
              style={{
                flexDirection: "row",
                gap: 10,
                alignItems: "center",
              }}
              onPress={handlePressUser}
            >
              <Image
                source={
                  postSenderData.profilePhoto ||
                  require("@/assets/images/user.jpg")
                }
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
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
                  <View
                    id="fullname-verified"
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <Text
                      bold
                      style={{
                        fontSize: 11,
                      }}
                    >
                      {postSenderData.fullname}
                    </Text>
                    {postSenderData.verified && (
                      <MaterialIcons
                        name="verified"
                        size={14}
                        color={apidonPink}
                      />
                    )}
                  </View>

                  <View
                    id="username-time"
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      overflow: "hidden",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                      }}
                    >
                      @{postSenderData.username}
                    </Text>

                    <Entypo name="dot-single" size={15} color="gray" />

                    <Text style={{ fontSize: 10, color: "gray" }}>
                      {formatDistanceToNowStrict(
                        new Date(postDocData.creationTime)
                      )}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          </View>

          <View
            style={{
              width: "5%",
            }}
          />

          {postDocData.collectibleStatus.isCollectible && (
            <View id="collectible-tag" style={{ width: "30%" }}>
              <NFTTag
                nftOptionsModalRef={nftOptionsModalRef}
                username={postSenderData.username}
              />
            </View>
          )}

          {(doesOwnPost || !doesFollow) && (
            <View
              style={{
                width: "5%",
              }}
            />
          )}

          {doesOwnPost ? (
            <View
              id="settings-button"
              style={{
                width: "5%",
                alignItems: "flex-end",
                overflow: "hidden",
              }}
            >
              <Pressable
                onPress={handleOptionsButton}
                disabled={postDeleteLoading}
              >
                {postDeleteLoading ? (
                  <ActivityIndicator color="red" />
                ) : (
                  <Entypo name="dots-three-vertical" size={18} color="white" />
                )}
              </Pressable>
            </View>
          ) : (
            !doesFollow && (
              <View
                style={{
                  width: "5%",
                }}
              >
                <Pressable
                  onPress={handleFollowButton}
                  disabled={followLoading}
                >
                  {followLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Feather name="user-plus" size={18} color="white" />
                  )}
                </Pressable>
              </View>
            )
          )}
        </View>

        {postDocData.image && <PostImage source={postDocData.image} />}

        <View
          id="footer"
          style={{
            width: "100%",
            gap: 5,
            paddingHorizontal: 5,
          }}
        >
          <View
            id="stars-star-share"
            style={{
              width: "100%",
              height: 75,
              flexDirection: "row",
              alignContent: "center",
              justifyContent: "space-between",
            }}
          >
            <Pressable
              onPress={handleOpenRatesModal}
              style={{
                width: "33%",
                justifyContent: "center",
                gap: 5,
              }}
            >
              <Stars
                score={
                  postDocData.ratingCount
                    ? postDocData.ratingSum / postDocData.ratingCount
                    : 0
                }
              />
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text bold>{postDocData.ratingCount}</Text>
                <Text> </Text>
                <Text>Rate{postDocData.ratingCount !== 1 && "s"}</Text>
              </View>
            </Pressable>

            <View
              id="rate-start"
              style={{
                position: "relative",
                width: "33%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <RateStar
                previousValue={ratingOfCurrentUser}
                postDocPath={postDocPath}
              />
            </View>

            <Pressable
              onPress={handleShareButton}
              style={{
                opacity: 1,
                width: "33%",
                justifyContent: "center",
                alignItems: "flex-end",
                paddingRight: 5,
              }}
            >
              <Feather name="share-2" size={24} color="white" />
            </Pressable>
          </View>

          <Pressable
            onPress={handleOpenCommentsModal}
            style={{ maxHeight: 100 }}
          >
            <View
              id="comments-preview"
              style={{
                gap: 3,
              }}
            >
              <View
                id="description"
                style={{
                  justifyContent: "center",
                }}
              >
                <ReactNativeText
                  style={{
                    color: "white",
                    fontSize: 12,
                    fontFamily: "Poppins-Regular",
                  }}
                  numberOfLines={3}
                >
                  <ReactNativeText
                    style={{
                      fontFamily: "Poppins-Bold",
                    }}
                  >
                    {postSenderData.username}
                  </ReactNativeText>

                  <ReactNativeText> </ReactNativeText>
                  <ReactNativeText> </ReactNativeText>

                  {postDocData.description}
                </ReactNativeText>
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
      </Animated.View>

      <CustomBottomModalSheet ref={postOptionsModalRef}>
        <View
          style={{
            flex: 1,
            gap: 10,
          }}
        >
          {postDocData.image &&
            !postDocData.collectibleStatus.isCollectible &&
            doesOwnPost && (
              <Pressable
                onPress={handleCreateNFTButton}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  backgroundColor: apidonPink,
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <Text bold style={{ fontSize: 16 }}>
                  Create Collectible
                </Text>
              </Pressable>
            )}

          <Pressable
            disabled={postDocData.collectibleStatus.isCollectible}
            style={{
              opacity: postDocData.collectibleStatus.isCollectible ? 0.5 : 1,
              padding: 10,
              borderRadius: 10,
              backgroundColor: "red",
              width: "100%",
              alignItems: "center",
            }}
            onPress={handleDeleteButton}
          >
            <Text
              bold
              style={{
                fontSize: 16,
              }}
            >
              Delete
            </Text>
          </Pressable>
        </View>
      </CustomBottomModalSheet>

      <CustomBottomModalSheet
        ref={nftOptionsModalRef}
        backgroundColor="#1B1B1B"
      >
        <NftBottomSheetContent
          postData={postDocData}
          postSenderData={postSenderData}
          closeNFTBottomSheet={closeNFTBottomSheet}
        />
      </CustomBottomModalSheet>
    </>
  );
});

export default Post;
