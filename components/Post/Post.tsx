import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import { Text } from "@/components/Text/Text";
import { apidonPink } from "@/constants/Colors";
import apiRoutes from "@/helpers/ApiRoutes";
import { useAuth } from "@/providers/AuthProvider";
import { PostServerData } from "@/types/Post";
import { UserInServer } from "@/types/User";
import { Entypo, Feather } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import firestore from "@react-native-firebase/firestore";
import { formatDistanceToNowStrict } from "date-fns";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useSetAtom } from "jotai";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  View,
} from "react-native";
import CustomBottomModalSheet from "../BottomSheet/CustomBottomModalSheet";
import RateStar from "./Rating/RateStar";
import Stars from "./Rating/Stars";

import auth from "@react-native-firebase/auth";

import appCheck from "@react-native-firebase/app-check";
import NFTTag from "./NFT/NFTTag";
import NftBottomSheetContent from "./NFT/NftBottomSheetContent";

type Props = {
  postDocPath: string;
};

const Post = React.memo(({ postDocPath }: Props) => {
  const { authStatus } = useAuth();

  const [loading, setLoading] = useState(false);

  const [postDocData, setPostDocData] = useState<PostServerData | null>(null);
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

  const overallRating = useMemo(() => {
    if (!postDocData) return 0;

    // Prevent 0-division
    const rateCount = postDocData.rates.length ? postDocData.rates.length : 1;

    let totalRates = postDocData.rates.reduce(
      (acc, current) => acc + current.rate,
      0
    );

    return totalRates / rateCount;
  }, [postDocData?.rates]);

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
            console.log("Post's realtime data can not be fecthed.");
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
  }, [authStatus, postDocData?.senderUsername]);

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

  const handleOpenRatesModal = () => {
    setScreenParameters([{ queryId: "postDocPath", value: postDocPath }]);
    router.push("/(modals)/rates");
  };

  const handleOpenCommentsModal = () => {
    setScreenParameters([{ queryId: "postDocPath", value: postDocPath }]);
    router.push("/(modals)/comments");
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
    return router.replace(`home/profile/${postSenderData.username}`);
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
        <ActivityIndicator size="large" color="white" />
      </View>
    );

  if (!postDocData || !postSenderData || postDeleted) return <></>;

  return (
    <>
      <Animated.View
        id="post-root"
        style={[
          {
            flex: 1,
            transform: [
              {
                scale: animatedScaleValue,
              },
            ],
          },
        ]}
      >
        <View
          id="header"
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            padding: 10,
            justifyContent: "space-between",
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
                  <Text
                    bold
                    style={{
                      fontSize: 11,
                    }}
                  >
                    {postSenderData.fullname}
                  </Text>

                  <View
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
            <NFTTag
              nftOptionsModalRef={nftOptionsModalRef}
              username={postDocData.senderUsername}
            />
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
                  width: "10%",
                  overflow: "hidden",
                }}
              >
                <Pressable
                  onPress={handleFollowButton}
                  disabled={followLoading}
                >
                  {followLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Feather name="user-plus" size={24} color="white" />
                  )}
                </Pressable>
              </View>
            )
          )}
        </View>

        {postDocData.image && (
          <Image
            source={postDocData.image}
            style={{
              width: "100%",
              aspectRatio: 1,
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
              <Stars score={overallRating} />
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text bold>{overallRating.toFixed(2)}</Text>
                <Text> average</Text>
              </View>
            </Pressable>

            <View
              style={{
                width: "33%",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
              }}
            >
              <RateStar
                previousValue={
                  postDocData.rates.find(
                    (r) => r.sender === auth().currentUser?.displayName
                  )?.rate
                }
                postDocPath={postDocPath}
              />
              <Pressable />
            </View>

            <View
              style={{
                opacity: 0.5,
                width: "33%",
                justifyContent: "center",
                alignItems: "flex-end",
                paddingRight: 5,
              }}
            >
              <Feather name="share-2" size={24} color="white" />
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
                  alignItems: "center",
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
                  {postDocData.comments.length
                    ? postDocData.comments.length
                    : 0}{" "}
                  comments
                </Text>
              </View>
            </View>
          </Pressable>
        </View>
      </Animated.View>

      <CustomBottomModalSheet ref={postOptionsModalRef} snapPoint="25%">
        <View
          style={{
            flex: 1,
            gap: 10,
          }}
        >
          {postDocData.image &&
            !postDocData.collectibleStatus.isCollectible && (
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
                  Make Collectible
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
        snapPoint="40%"
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
