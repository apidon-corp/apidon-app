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
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text as ReactNativeText,
  View,
} from "react-native";
import CustomBottomModalSheet from "../BottomSheet/CustomBottomModalSheet";
import RateStar from "./Rating/RateStar";
import Stars from "./Rating/Stars";

import Animated, {
  runOnJS,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import auth from "@react-native-firebase/auth";

import appCheck from "@react-native-firebase/app-check";
import NFTTag from "./NFT/NFTTag";
import NftBottomSheetContent from "./NFT/NftBottomSheetContent";
import PostImage from "./PostImage";

import { Share } from "react-native"; // Replace Sharing with Share

import PostSettingsBottomSheetContent from "./PostSettingsBottomSheetContent";
import PostSkeleton from "./PostSkeleon";

type Props = {
  postDocPath: string;
  deletePostDocPathFromArray?: (postDocPath: string) => void;
  height?: number;
};

const Post = React.memo(
  ({ postDocPath, deletePostDocPathFromArray, height }: Props) => {
    const { authStatus } = useAuth();

    const [postDocData, setPostDocData] = useState<PostServerData | null>(null);
    const [postSenderData, setPostSenderData] = useState<UserInServer | null>(
      null
    );

    const [doesOwnPost, setDoesOwnPost] = useState(false);

    const [doesFollow, setDoesFollow] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);

    const [postDeleteLoading, setPostDeleteLoading] = useState(false);
    const [postDeleted, setPostDeleted] = useState(false);

    // Null means is not set yet.
    const [postNotFound, setPostNotFound] = useState<null | boolean>(null);

    const animatedScaleValue = useSharedValue(1);

    const postOptionsModalRef = useRef<BottomSheetModal>(null);

    const nftOptionsModalRef = useRef<BottomSheetModal>(null);

    const pathname = usePathname();

    const [ratingOfCurrentUser, setRatingOfCurrentUser] = useState<
      undefined | number
    >(undefined);

    const [currentUserBlockedBySender, setCurrentUserBlockedBySender] =
      useState<null | boolean>(null);

    // Dynamic Data Fetching / Post Object
    useEffect(() => {
      if (
        authStatus !== "authenticated" ||
        postDeleted ||
        !postDocPath ||
        postNotFound ||
        postNotFound === null
      ) {
        return setPostDocData(null);
      }

      const unsubscribe = firestore()
        .doc(postDocPath)
        .onSnapshot(
          (snapshot) => {
            if (!snapshot.exists) {
              return handleDeletingAnimation();
            }

            setPostDocData(snapshot.data() as PostServerData);

            setDoesOwnPost(
              (snapshot.data() as PostServerData).senderUsername ===
                auth().currentUser?.displayName
            );
          },
          (error) => {
            console.error(
              "Error on getting realtime data of post: ",
              postDocPath,
              "\n",
              error
            );
          }
        );

      return () => unsubscribe();
    }, [postDocPath, authStatus, postDeleted, postNotFound]);

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

    // Getting Post Sender Data.
    useEffect(() => {
      if (authStatus !== "authenticated") return;

      if (!postDocData) return;

      if (postSenderData) return;

      handleGetSenderData();
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

    // Realtime Block Checking
    useEffect(() => {
      if (doesOwnPost) return setCurrentUserBlockedBySender(false);

      const displayName = auth().currentUser?.displayName || "";
      if (!displayName) return;

      if (!postSenderData) return;

      const unsubscribe = firestore()
        .doc(`users/${postSenderData.username}/blocks/${displayName}`)
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
    }, [doesOwnPost, postSenderData]);

    /**
     * Checking post availability...
     */
    useEffect(() => {
      if (authStatus !== "authenticated") return;

      if (!postDocPath) return;

      handleCheckPostAvailability();
    }, [postDocPath, authStatus]);

    const handleGetSenderData = async () => {
      if (!postDocData) return setPostSenderData(null);

      try {
        const userDoc = await firestore()
          .doc(`users/${postDocData.senderUsername}`)
          .get();
        if (!userDoc.exists) {
          console.error("Sender user data can not be fetched.");
          setPostSenderData(null);
        }

        const data = userDoc.data() as UserInServer;

        setPostSenderData(data);
      } catch (error) {
        console.error("Error on getting sender data: ", error);
        setPostSenderData(null);
      }
    };

    const handleCheckPostAvailability = async () => {
      try {
        const postDoc = await firestore().doc(postDocPath).get();

        return setPostNotFound(!postDoc.exists);
      } catch (error) {
        console.error("Error on checking post availability: ", error);
        setPostNotFound(false);
      }
    };

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

        return setPostDeleteLoading(false);
      } catch (error) {
        setPostDeleteLoading(false);
        return console.error("Error on deleting post: ", error);
      }
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
        const baseURL = process.env.EXPO_PUBLIC_APP_LINK_BASE_URL || "";
        if (!baseURL) return;

        const url =
          baseURL +
          "/" +
          "p" +
          "/" +
          postDocData.senderUsername +
          "-" +
          postDocData.id;

        await Share.share({
          message: url,
          title: `Share this post with your friends!`,
        });
      } catch (error) {
        console.error(error);
      }
    };

    /**
     * Handles both deleting animation and changing state variable.
     */
    const handleDeletingAnimation = () => {
      if (!deletePostDocPathFromArray) return;

      animatedScaleValue.value = withTiming(0, { duration: 500 }, () => {
        runOnJS(setPostDeleted)(true);
        runOnJS(deletePostDocPathFromArray)(postDocPath);
      });
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

    if (postDeleted === null || !postDocData || !postSenderData) {
      return <PostSkeleton height={height} />;
    }

    if (
      postDeleted ||
      currentUserBlockedBySender ||
      postSenderData.isScheduledToDelete ||
      currentUserBlockedBySender
    )
      return <></>;

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
            height: height || 630,
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
                width: "50%",
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
                          fontSize: 10,
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
                          fontSize: 10,
                        }}
                      >
                        @{postSenderData.username}
                      </Text>

                      <Entypo name="dot-single" size={15} color="gray" />

                      <Text style={{ fontSize: 9, color: "gray" }}>
                        {formatDistanceToNowStrict(
                          new Date(postDocData.creationTime)
                        )}
                      </Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            </View>

            <View id="collectible-tag" style={{ width: "30%" }}>
              {postDocData.collectibleStatus.isCollectible && (
                <NFTTag
                  nftOptionsModalRef={nftOptionsModalRef}
                  username={postSenderData.username}
                />
              )}
            </View>

            {!doesFollow && !doesOwnPost && (
              <Pressable
                onPress={handleFollowButton}
                disabled={followLoading}
                style={{
                  width: "7%",
                  alignItems: "flex-end",
                  justifyContent: "center",
                }}
              >
                {followLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Feather name="user-plus" size={18} color="white" />
                )}
              </Pressable>
            )}

            <Pressable
              id="settings-button"
              onPress={handleOptionsButton}
              disabled={postDeleteLoading}
              style={{
                width: "7%",
                alignItems: "flex-end",
                overflow: "hidden",
              }}
            >
              {postDeleteLoading ? (
                <ActivityIndicator color="red" />
              ) : (
                <Entypo name="dots-three-vertical" size={18} color="white" />
              )}
            </Pressable>
          </View>

          <PostImage source={postDocData.image} />

          <View
            id="footer"
            style={{
              width: "100%",
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
                    Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
                    Aenean commodo ligula eget dolor. Aenean massa. Cum sociis
                    natoque.
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

        <>
          <CustomBottomModalSheet ref={postOptionsModalRef}>
            <PostSettingsBottomSheetContent
              doesOwnPost={doesOwnPost}
              handleDeleteButton={handleDeleteButton}
              postDocData={postDocData}
              postDocPath={postDocPath}
              postOptionsModalRef={postOptionsModalRef}
            />
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
      </>
    );
  }
);

export default Post;
